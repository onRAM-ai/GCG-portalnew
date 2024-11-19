-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('VENUE_GUIDE', 'USER_GUIDE', 'POLICY')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Create document access table
CREATE TABLE IF NOT EXISTS public.document_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('VIEW', 'EDIT')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_document_access UNIQUE (document_id, user_id)
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all documents"
  ON public.documents
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Venues can manage their documents"
  ON public.documents
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view permitted documents"
  ON public.documents
  FOR SELECT
  USING (
    type = 'USER_GUIDE' OR
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = documents.id
      AND user_id = auth.uid()
    )
  );

-- Create function to check document access
CREATE OR REPLACE FUNCTION check_document_access(
  p_document_id UUID,
  p_user_id UUID,
  p_access_type TEXT DEFAULT 'VIEW'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM documents d
    LEFT JOIN document_access da ON da.document_id = d.id
    WHERE d.id = p_document_id
    AND (
      -- Admin access
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_user_id
        AND role = 'admin'
      ) OR
      -- Venue owner access
      (d.venue_id IN (
        SELECT id FROM venues WHERE owner_id = p_user_id
      )) OR
      -- User guide access
      d.type = 'USER_GUIDE' OR
      -- Explicit access granted
      (da.user_id = p_user_id AND
       (p_access_type = 'VIEW' OR da.access_type = 'EDIT'))
    )
  );
END;
$$;