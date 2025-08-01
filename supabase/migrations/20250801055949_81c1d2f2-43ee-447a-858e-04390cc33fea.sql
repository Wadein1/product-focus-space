-- Create fundraiser_requests table
CREATE TABLE public.fundraiser_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fundraiser_goal TEXT NOT NULL,
  description TEXT NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fundraiser_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert requests
CREATE POLICY "Anyone can submit fundraiser requests" 
ON public.fundraiser_requests 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin to view all requests
CREATE POLICY "Admin can view all fundraiser requests" 
ON public.fundraiser_requests 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_fundraiser_requests_updated_at
BEFORE UPDATE ON public.fundraiser_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();