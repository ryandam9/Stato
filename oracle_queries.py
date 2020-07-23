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
       t.plan_hash_value,
       t.disk_reads,
       t.buffer_gets,
       t.fetches,
       t.sorts,
       t.cpu_time/1000000 cpu,
       t.rows_processed,
       t.elapsed_time,
       t.version_count
FROM V$SQLSTATS t,
     V$SQL s
WHERE t.sql_id = s.sql_id
  AND ROWNUM < 100
ORDER BY t.last_active_time DESC
"""
}


qry['query-statistics'] = {
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
