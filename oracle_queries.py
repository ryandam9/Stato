qry = dict()

# Find All the Users in the Database
qry['schemas'] = {
    'heading': 'Schemas',
    'caption': 'All Schemas exist in the DB',
    'category': 'overview',
    'query': """
SELECT
    USERNAME
FROM
    DBA_USERS
ORDER BY
    USERNAME
"""
}

qry['database-properties'] = {
    'heading': 'Database Properties',
    'caption': 'These are Permanent database properties from DATABASE_PROPERTIES',
    'category': 'overview',
    'query': """
SELECT
    *
FROM
    database_properties
ORDER BY
    property_name
"""
}

qry['database-parameters'] = {
    'heading': 'DB Parameters',
    'caption': 'DB parameters from V$PARAMETER',
    'category': 'overview',
    'query': """
SELECT
   name
 , value
FROM
    V$PARAMETER
"""
}

# Tables in a Schema
qry['tables'] = {
    'heading': 'Tables in a Schema',
    'caption': '',
    'category': 'overview',
    'query': """
SELECT 
      owner
    , table_name
    , tablespace_name
    , cluster_name
    , iot_name
    , status
    , pct_free
    , pct_used
    , ini_trans
    , max_trans
    , initial_extent
    , next_extent
    , min_extents
    , max_extents
    , pct_increase
    , freelists
    , freelist_groups
    , logging
    , backed_up
    , num_rows
    , blocks
    , empty_blocks
    , avg_space
    , chain_cnt
    , avg_row_len
    , avg_space_freelist_blocks
    , num_freelist_blocks
    , degree
    , instances
    , cache
    , table_lock
    , sample_size
--    , last_analyzed
    , partitioned
    , iot_type
    , temporary
    , secondary
    , nested
    , buffer_pool
    , flash_cache
    , cell_flash_cache
    , row_movement
    , global_stats
    , user_stats
    , duration
    , skip_corrupt
    , monitoring
    , cluster_owner
    , dependencies
    , compression
    , compress_for
    , dropped
    , read_only
    , segment_created
    , result_cache
FROM
    DBA_TABLES
WHERE
    OWNER = :schema
ORDER BY
    BLOCKS DESC    
"""
}

qry['datafiles-usage'] = {
    'heading': 'Data Files Usage',
    'caption': 'Tablespaces and their current state',
    'category': 'storage',
    'query': """
SELECT
    TABLESPACE_NAME,
    MAXBYTES / 1024 / 1024 / 1024 MAX_BYTES_GB,
    BYTES / 1024 / 1024 / 1024 AS SIZE_OF_FILE_GB ,
    USER_BYTES / 1024 / 1024 / 1024 AS SIZE_OF_FILE_FOR_USERDATA_GB,
    AUTOEXTENSIBLE,
    STATUS,
    FILE_ID,
    FILE_NAME
FROM
    DBA_DATA_FILES
ORDER BY
    TABLESPACE_NAME
"""
}

qry['tempfiles-usage'] = {
    'heading': 'Temp Files Usage',
    'caption': '',
    'category': 'storage',
    'query': """
SELECT
    TABLESPACE_NAME,
    MAXBYTES / 1024 / 1024 / 1024 MAX_BYTES_GB,
    BYTES / 1024 / 1024 / 1024 AS SIZE_OF_FILE_GB ,
    USER_BYTES / 1024 / 1024 / 1024 AS SIZE_OF_FILE_FOR_USERDATA_GB,
    AUTOEXTENSIBLE,
    STATUS,
    FILE_ID,
    FILE_NAME
FROM
    DBA_TEMP_FILES
ORDER BY
    TABLESPACE_NAME
"""
}

# Long Running Queries
qry['long-running-queries'] = {
    'heading': 'Long Running Queries',
    'caption': 'Listed based on V$SESSION_LONGOPS data',
    'category': 'in-progress-queries',
    'query': """
SELECT
  sid
, serial#
, opname
, target
, target_desc
, sofar
, totalwork
, units
, start_time
, last_update_time
, timestamp
, time_remaining
, elapsed_seconds
, context
, message
, username
, sql_address
, sql_hash_value
, sql_id
, sql_plan_hash_value
, sql_exec_start
, sql_exec_id
, sql_plan_line_id
, sql_plan_operation
, sql_plan_options
, qcsid
FROM
    V$SESSION_LONGOPS
WHERE
    sofar <> totalwork
"""
}

qry['queries-resource-usage'] = {
    'heading': 'Queries & Resource Usage',
    'caption': 'These are the queries consuming System resources the most.',
    'category': 'in-progress-queries',
    'query': """
SELECT s.parsing_schema_name schema,
       t.sql_id,
       to_char(t.last_active_time,'yyyy-mm-dd:hh24:mi:ss') last_active_time,
       t.sql_text,
       t.disk_reads,
       t.buffer_gets,
       t.fetches,
       t.sorts,
       t.cpu_time/1000000 cpu,
       t.rows_processed
FROM V$SQLSTATS t,
     V$SQL s
WHERE t.sql_id = s.sql_id
ORDER BY t.last_active_time DESC
"""
}

qry['data-dictionary-views'] = {
    'heading': 'Catalog tables',
    'caption': '',
    'category': 'catalog-tables',
    'query': """
SELECT 
    view_name
FROM 
    dba_views a
WHERE 
    (view_name LIKE 'V$%'
OR  view_name LIKE 'GV$%'
OR  view_name LIKE 'ALL_%'
OR  view_name LIKE 'DBA_%'  
OR  view_name LIKE 'USER_%')
AND EXISTS (SELECT 1 FROM DBA_OBJECTS b WHERE a.owner = b.owner AND a.view_name = b.object_name)
ORDER BY 1
"""
}

########################################################################################################################
# Data related to a SQLID
########################################################################################################################

# Long Running Query
qry['long-running-query'] = {
    'heading': 'Long Running Queries',
    'caption': 'Listed based on V$SESSION_LONGOPS data',
    'category': 'in-progress-queries',
    'query': """
SELECT
  sid
, serial#
, opname
, target
, target_desc
, sofar
, totalwork
, units
, start_time
, last_update_time
, timestamp
, time_remaining
, elapsed_seconds
, context
, message
, username
, sql_address
, sql_hash_value
, sql_id
, sql_plan_hash_value
, sql_exec_start
, sql_exec_id
, sql_plan_line_id
, sql_plan_operation
, sql_plan_options
, qcsid
FROM
    V$SESSION_LONGOPS
WHERE
    sql_id = :sqlid
"""
}

# Query Resource Usage
qry['query-resource-usage'] = {
    'heading': 'Statistics of a Query',
    'caption': '',
    'category': 'in-progress-queries',
    'query': """
SELECT * 
FROM (SELECT sql_id, 
             to_char(sql_exec_start,'yyyy-mm-dd:hh24:mi:ss') sql_exec_start,
             sql_exec_id, 
             sum(buffer_gets) buffer_gets,
             sum(disk_reads) disk_reads, 
             round(sum(cpu_time/1000000),1) cpu_secs
      FROM v$sql_monitor
      WHERE sql_id = :sql_id
      GROUP BY sql_id, sql_exec_start, sql_exec_id
      ORDER BY 2 desc)
WHERE rownum <= 50
"""
}

# SQL Text
qry['sql_text'] = {
    'heading': 'SQL Text',
    'caption': '',
    'category': 'in-progress-queries',
    'query': """
SELECT sql_fulltext
FROM   gv$sql
WHERE  sql_id = :sql_id
"""
}

# Query Progress Against Execution Plan
qry['query-progress-against-plan'] = {
    'heading': 'Query Progress Against Execution Plan',
    'caption': '',
    'category': 'in-progress-queries',
    'query': """
SELECT sid, 
       sql_id, 
       status, 
       plan_line_id,
       plan_operation || ' ' || plan_options operation, 
       (CASE
           WHEN plan_object_owner IS NOT NULL AND plan_object_name IS NOT NULL THEN
                plan_object_owner || '.' || plan_object_name || ' ~ ' || plan_object_type 
           ELSE
                ' '
        END) AS plan_object,
       output_rows
FROM   V$SQL_PLAN_MONITOR
WHERE  (sql_id, sql_exec_id, sid) = (SELECT sql_id, sql_exec_id, sid
                                     FROM   V$SQL_MONITOR a
                                     WHERE  sql_id = :sql_id
                                       AND  sql_exec_id = (SELECT MAX(sql_exec_id) FROM V$SQL_MONITOR WHERE sql_id = a.sql_id)
                                     )  
ORDER BY 1,4
"""
}

# Temp Space use of an SQL ID
qry['temp-space-use-sqlid'] = {
    'heading': 'Temp Space Use of an SQL',
    'caption': '',
    'category': 'in-progress-queries',
    'query': """
SELECT 
    t.*
FROM
    V$TEMPSEG_USAGE t
WHERE
    t.sql_id = :sql_id
"""
}

# Data from DBA Hist Tables
qry['dba-hist-1'] = {
    'heading': 'Fetches and Deltas',
    'caption': '',
    'category': 'in-progress-queries',
    'query': """
SELECT
    a.sql_id,
    to_char(begin_interval_time, 'yyyy-mm-dd:hh24:mi:ss') begin_interval_time,
    b.error_count,
    a.parsing_schema_name,
    a.fetches_total,
    a.fetches_delta,
    a.executions_total,
    a.executions_delta,
    a.rows_processed_delta
FROM
    DBA_HIST_SQLSTAT a,
    DBA_HIST_SNAPSHOT b
WHERE
    a.snap_id = b.snap_id
AND a.instance_number = b.instance_number
AND a.sql_id = :sql_id
ORDER BY begin_interval_time DESC    
"""
}

# ----------------------------------------------------------------------------------------------------------------------
# Waiting Related Queries
# ----------------------------------------------------------------------------------------------------------------------
# Sessions in WAIT State
qry['waiting-sessions'] = {
    'heading': 'Sessions that are in WAIT State',
    'caption': '',
    'category': 'waits',
    'query': """
SELECT 
    s.sid,
    s.username,
    s.event,
    s.blocking_session,
    s.seconds_in_wait,
    s.wait_time
FROM
    V$SESSION s
WHERE
    s.state IN ('WAITING')
ORDER BY
    s.username, s.sid
"""
}

# Sessions with High I/O Activity
qry['sessions-with-high-IO'] = {
     'heading': 'Sessions with High I/O Activity',
     'caption': '',
     'category': 'waits',
     'query': """
 SELECT
     osuser,
     username,
     process pid,
     ses.sid,
     serial#,
     ses.sql_id,
     physical_reads,
     block_changes
 FROM
     v$session ses,
     v$sess_io sio
 WHERE
     ses.sid = sio.sid
 ORDER BY
     username, ses.sid, ses.serial#, ses.sql_id DESC
 """
 }

# Get all tables names in a Schema
qry['get-tables-in-a-schema'] = {
     'heading': 'Get tables names in a Schema',
     'caption': '',
     'category': 'Tables',
     'query': """
 SELECT DISTINCT
     at.TABLE_NAME
 FROM
     ALL_TABLES at
 WHERE
     at.OWNER = :schema_name
 ORDER BY
    at.TABLE_NAME
 """
 }
