CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  full_name text;
  name_parts text[];
  fname text;
  lname text;
BEGIN
  -- Get the full name from metadata with proper NULL handling
  full_name := COALESCE(
    new.raw_user_meta_data->>'name',
    NULLIF(TRIM(COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', '')), ''),
    ''
  );
  
  -- Split the name into parts only if we have a name
  IF full_name != '' THEN
    name_parts := string_to_array(trim(full_name), ' ');
    fname := name_parts[1];
    -- Join remaining parts as last name
    IF array_length(name_parts, 1) > 1 THEN
      lname := array_to_string(name_parts[2:array_length(name_parts, 1)], ' ');
    END IF;
  END IF;
  
  -- Use individual fields as fallback with proper NULL handling
  fname := COALESCE(NULLIF(fname, ''), new.raw_user_meta_data->>'first_name', 'User');
  lname := COALESCE(NULLIF(lname, ''), new.raw_user_meta_data->>'last_name', '');
  
  INSERT INTO public.profiles (id, first_name, last_name, email, phone)
  VALUES (
    new.id,
    fname,
    lname,
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', new.phone)
  );
  RETURN new;
END;
$function$;