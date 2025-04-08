
-- Function to get all telegram files
CREATE OR REPLACE FUNCTION public.get_all_telegram_files()
RETURNS SETOF telegram_files AS $$
BEGIN
  RETURN QUERY SELECT * FROM telegram_files ORDER BY upload_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search telegram files
CREATE OR REPLACE FUNCTION public.search_telegram_files(search_query text)
RETURNS SETOF telegram_files AS $$
BEGIN
  RETURN QUERY 
    SELECT * FROM telegram_files 
    WHERE 
      LOWER(file_name) LIKE '%' || LOWER(search_query) || '%'
      OR 
      metadata::text ILIKE '%' || LOWER(search_query) || '%'
    ORDER BY upload_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a telegram file
CREATE OR REPLACE FUNCTION public.delete_telegram_file(file_id_param text)
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_files WHERE file_id = file_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
