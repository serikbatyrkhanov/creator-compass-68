-- Make first_name and last_name nullable to handle missing metadata
ALTER TABLE public.profiles 
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL;

-- Update the handle_new_user function to parse the name field and handle missing metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name text;
  name_parts text[];
  fname text;
  lname text;
BEGIN
  -- Get the full name from metadata
  full_name := COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name', '');
  
  -- Split the name into parts
  IF full_name != '' THEN
    name_parts := string_to_array(trim(full_name), ' ');
    fname := name_parts[1];
    -- Join remaining parts as last name
    IF array_length(name_parts, 1) > 1 THEN
      lname := array_to_string(name_parts[2:array_length(name_parts, 1)], ' ');
    END IF;
  END IF;
  
  -- Use individual fields as fallback
  fname := COALESCE(fname, new.raw_user_meta_data->>'first_name', 'User');
  lname := COALESCE(lname, new.raw_user_meta_data->>'last_name', '');
  
  INSERT INTO public.profiles (id, first_name, last_name, email, phone)
  VALUES (
    new.id,
    fname,
    lname,
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;

-- Create profile records for existing users who don't have profiles
INSERT INTO public.profiles (id, first_name, last_name, email, phone)
SELECT 
  au.id,
  COALESCE(
    split_part(au.raw_user_meta_data->>'name', ' ', 1),
    au.raw_user_meta_data->>'first_name',
    'User'
  ) as first_name,
  COALESCE(
    CASE 
      WHEN array_length(string_to_array(au.raw_user_meta_data->>'name', ' '), 1) > 1 
      THEN array_to_string((string_to_array(au.raw_user_meta_data->>'name', ' '))[2:], ' ')
      ELSE NULL
    END,
    au.raw_user_meta_data->>'last_name',
    ''
  ) as last_name,
  au.email,
  au.raw_user_meta_data->>'phone' as phone
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Add comment explaining the fix
COMMENT ON FUNCTION public.handle_new_user IS 'Creates profile for new users, parsing name field and handling missing metadata gracefully';