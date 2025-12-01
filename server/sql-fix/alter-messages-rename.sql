-- SQL fix: rename 'read' column to 'is_read' in Messages table
-- Run in SSMS or sqlcmd against 'bowdb'

BEGIN TRANSACTION;

-- Add new column if not exists
IF COL_LENGTH('Messages', 'is_read') IS NULL
BEGIN
    ALTER TABLE Messages ADD is_read BIT DEFAULT 0;
END

-- If the old column 'read' exists, preserve data (use dynamic SQL to avoid compile-time failures)
IF COL_LENGTH('dbo.Messages', 'read') IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    -- Update is_read from read
    SET @sql = N'UPDATE dbo.Messages SET is_read = CASE WHEN [read] = 1 THEN 1 ELSE 0 END WHERE [read] IS NOT NULL;';
    EXEC sp_executesql @sql;
    -- Drop the read column
    SET @sql = N'ALTER TABLE dbo.Messages DROP COLUMN [read];';
    EXEC sp_executesql @sql;
END

COMMIT TRANSACTION;

-- Confirm columns
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Messages';
