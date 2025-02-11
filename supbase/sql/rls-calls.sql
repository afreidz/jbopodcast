ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow host to access call"
ON calls
FOR SELECT USING (auth.uid() = "hostId");

CREATE POLICY "Allow guests to access call"
ON calls
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM "_GuestRelation" gr
        WHERE "A" = calls.id  -- Ensure the call matches
        AND "B" = auth.uid()  -- Ensure the user is a guest
    )
);

CREATE POLICY "Allow hosts to insert calls"
ON calls
FOR INSERT WITH CHECK (auth.uid() = "hostId");
