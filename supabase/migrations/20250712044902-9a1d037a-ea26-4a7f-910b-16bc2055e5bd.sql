-- Fix function search path security issues

-- Fix recover_fundraiser_orders function
CREATE OR REPLACE FUNCTION public.recover_fundraiser_orders()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    order_record RECORD;
    variation_record RECORD;
    fundraiser_record RECORD;
    donation_amount NUMERIC;
BEGIN
    -- Loop through orders that are marked as fundraiser orders but missing from fundraiser_orders table
    FOR order_record IN 
        SELECT o.* FROM orders o 
        WHERE o.is_fundraiser = true 
        AND o.id NOT IN (SELECT order_id FROM fundraiser_orders WHERE order_id IS NOT NULL)
    LOOP
        -- Try to match the product name to a fundraiser variation
        -- Extract variation name from product format "FundraiserTitle - VariationTitle"
        FOR variation_record IN
            SELECT fv.*, f.id as fundraiser_id, f.donation_type, f.donation_percentage, f.donation_amount as fundraiser_donation_amount
            FROM fundraiser_variations fv
            JOIN fundraisers f ON f.id = fv.fundraiser_id
            WHERE order_record.product_name ILIKE '%' || fv.title || '%'
            ORDER BY LENGTH(fv.title) DESC -- Match longest title first for better accuracy
            LIMIT 1
        LOOP
            -- Calculate donation amount based on fundraiser settings
            IF variation_record.donation_type = 'percentage' THEN
                donation_amount := (order_record.price / order_record.quantity) * (variation_record.donation_percentage / 100.0) * order_record.quantity;
            ELSE
                donation_amount := variation_record.fundraiser_donation_amount * order_record.quantity;
            END IF;

            -- Update the order with fundraiser information
            UPDATE orders 
            SET fundraiser_id = variation_record.fundraiser_id,
                variation_id = variation_record.id
            WHERE id = order_record.id;

            -- Insert into fundraiser_orders table
            INSERT INTO fundraiser_orders (
                fundraiser_id,
                variation_id,
                order_id,
                amount,
                donation_amount
            ) VALUES (
                variation_record.fundraiser_id,
                variation_record.id,
                order_record.id,
                order_record.price,
                donation_amount
            );

            -- Log the recovery
            RAISE NOTICE 'Recovered fundraiser order: Order % mapped to Fundraiser % with donation amount %', 
                order_record.id, variation_record.fundraiser_id, donation_amount;
        END LOOP;
    END LOOP;
END;
$function$;

-- Fix get_fundraiser_stats_improved function
CREATE OR REPLACE FUNCTION public.get_fundraiser_stats_improved(fundraiser_id_param uuid)
RETURNS TABLE(total_items_sold bigint, total_raised numeric, total_orders bigint)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(o.quantity), 0)::bigint as total_items_sold,
        COALESCE(SUM(fo.donation_amount), 0) as total_raised,
        COUNT(DISTINCT fo.order_id)::bigint as total_orders
    FROM fundraiser_orders fo
    JOIN orders o ON o.id = fo.order_id
    WHERE fo.fundraiser_id = fundraiser_id_param;
END;
$function$;

-- Fix validate_fundraiser_tracking function
CREATE OR REPLACE FUNCTION public.validate_fundraiser_tracking()
RETURNS TABLE(order_id uuid, product_name text, is_fundraiser boolean, has_tracking boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.product_name,
        o.is_fundraiser,
        (fo.order_id IS NOT NULL) as has_tracking
    FROM orders o
    LEFT JOIN fundraiser_orders fo ON fo.order_id = o.id
    WHERE o.is_fundraiser = true
    ORDER BY o.created_at DESC;
END;
$function$;

-- Fix update_fundraiser_totals_safe function
CREATE OR REPLACE FUNCTION public.update_fundraiser_totals_safe()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if we have a valid fundraiser_id
  IF TG_OP = 'INSERT' THEN
    -- For INSERT operations, use NEW.id (the fundraiser's own id)
    INSERT INTO public.fundraiser_totals (fundraiser_id, title, total_raised, total_items_sold, donation_amount)
    SELECT 
      NEW.id,
      NEW.title,
      0 as total_raised,
      0 as total_items_sold,
      COALESCE(NEW.donation_amount, 0)
    ON CONFLICT (fundraiser_id) 
    DO UPDATE SET
      title = EXCLUDED.title,
      donation_amount = EXCLUDED.donation_amount,
      updated_at = now();
    
    RETURN NEW;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix safe_fundraiser_insert function
CREATE OR REPLACE FUNCTION public.safe_fundraiser_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- This function will only handle fundraiser inserts safely
  -- It doesn't try to access non-existent fields
  RETURN NEW;
END;
$function$;

-- Fix update_fundraiser_totals_from_orders function
CREATE OR REPLACE FUNCTION public.update_fundraiser_totals_from_orders()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update or insert fundraiser totals
  INSERT INTO fundraiser_totals (
    fundraiser_id,
    title,
    total_raised,
    total_items_sold,
    donation_amount,
    updated_at
  )
  SELECT 
    f.id,
    f.title,
    COALESCE(SUM(fo.donation_amount), 0),
    COALESCE(COUNT(fo.id), 0),
    f.donation_amount,
    NOW()
  FROM fundraisers f
  LEFT JOIN fundraiser_orders fo ON f.id = fo.fundraiser_id
  WHERE f.id = COALESCE(NEW.fundraiser_id, OLD.fundraiser_id)
  GROUP BY f.id, f.title, f.donation_amount
  ON CONFLICT (fundraiser_id)
  DO UPDATE SET
    total_raised = EXCLUDED.total_raised,
    total_items_sold = EXCLUDED.total_items_sold,
    updated_at = EXCLUDED.updated_at;
    
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix calculate_fundraiser_profit function
CREATE OR REPLACE FUNCTION public.calculate_fundraiser_profit(fundraiser_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    total_profit numeric := 0;
    order_record RECORD;
    stripe_fee numeric;
    donation_amount numeric;
    revenue_per_order numeric;
BEGIN
    -- Loop through all orders for this fundraiser
    FOR order_record IN 
        SELECT o.price, o.quantity, o.shipping_cost, fo.donation_amount
        FROM orders o
        JOIN fundraiser_orders fo ON fo.order_id = o.id
        WHERE fo.fundraiser_id = fundraiser_id_param
    LOOP
        -- Calculate revenue (price excluding shipping)
        revenue_per_order := order_record.price - order_record.shipping_cost;
        
        -- Calculate Stripe fee (2.9% + $0.30 per transaction)
        stripe_fee := (order_record.price * 0.029) + 0.30;
        
        -- Calculate profit for this order: revenue - donation - stripe fees
        total_profit := total_profit + (revenue_per_order - order_record.donation_amount - stripe_fee);
    END LOOP;
    
    RETURN COALESCE(total_profit, 0);
END;
$function$;