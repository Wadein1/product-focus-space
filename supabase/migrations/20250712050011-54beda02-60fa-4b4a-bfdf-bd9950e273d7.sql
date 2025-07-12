-- Create triggers to automatically update fundraiser totals when orders are added

-- Create trigger for fundraiser_orders table to update totals when orders are inserted/updated/deleted
CREATE OR REPLACE TRIGGER update_fundraiser_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON fundraiser_orders
    FOR EACH ROW EXECUTE FUNCTION update_fundraiser_totals_from_orders();

-- Create trigger for fundraisers table to ensure totals record exists when fundraiser is created
CREATE OR REPLACE TRIGGER safe_fundraiser_insert_trigger
    AFTER INSERT ON fundraisers
    FOR EACH ROW EXECUTE FUNCTION update_fundraiser_totals_safe();

-- Manually refresh existing fundraiser totals to ensure they're accurate
DO $$
DECLARE
    fundraiser_record RECORD;
BEGIN
    -- Loop through all fundraisers and update their totals
    FOR fundraiser_record IN 
        SELECT id FROM fundraisers
    LOOP
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
        WHERE f.id = fundraiser_record.id
        GROUP BY f.id, f.title, f.donation_amount
        ON CONFLICT (fundraiser_id)
        DO UPDATE SET
            total_raised = EXCLUDED.total_raised,
            total_items_sold = EXCLUDED.total_items_sold,
            updated_at = EXCLUDED.updated_at;
    END LOOP;
END $$;