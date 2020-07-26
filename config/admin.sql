--
-- Show SQL Text
--
SELECT sql_fulltext
FROM   gv$sql
WHERE  sql_id = '7gtys6vx02ymj'

--
-- CPUs on the DB
--
SELECT 
    (SELECT MAX(value) FROM DBA_HIST_OSSTAT WHERE STAT_NAME = 'NUM_CPUS') cpu_count,
    (SELECT MAX(value) FROM DBA_HIST_OSSTAT WHERE STAT_NAME = 'NUM_CPU_CORES') cpu_cores,
    (SELECT MAX(value) FROM DBA_HIST_OSSTAT WHERE STAT_NAME = 'NUM_CPU_SOCKETS') cpu_sockets
FROM DUAL;
    
show parameter cpu

--
-- V$SQLSTATS displays basic performance statistics for SQL Cursors and contains one row per SQL Statement
-- (that is, one row per unique value of SQL_ID). It differs from V$SQL and V$SQLAREA in that it is faster,
-- scalable, and has a greater data retention.
SELECT
    s.parsing_schema_name schema,
    t.sql_id,
    t.sql_text,
    t.disk_reads,
    t.sorts,
    t.cpu_time / 1000000 cpu,
    t.rows_processed,
    t.elapsed_time,
    t.fetches,
    t.executions,
    t.direct_writes
FROM 
    V$SQLSTATS t,
    V$SQL s
WHERE
    t.sql_id = s.sql_id
AND t.sql_id = '7gtys6vx02ymj';

--
-- Query progress against execution plan
--
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
                                     WHERE  sql_id = '7kngmdwtb1dsh'
                                       AND  sql_exec_id = (SELECT MAX(sql_exec_id) FROM V$SQL_MONITOR WHERE sql_id = a.sql_id)
                                     )  
ORDER BY 1,4

--
-- Statistics about temporary tablespace extents
--
SELECT
    s.tablespace_name,
    s.current_users,
    s.extent_size,
    s.total_extents,
    s.used_extents,
    s.free_extents,
    s.extent_hits
FROM
    V$SORT_SEGMENT s
ORDER BY
    s.tablespace_name;

--
-- Temp Space use of a SQLID
--
SELECT 
    t.*
FROM
    V$TEMPSEG_USAGE t
WHERE
    t.sql_id = '7kngmdwtb1dsh'
    
--
-- Waiting
-- 
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
    s.username, s.sid;
    
--
-- SQL Tuning
--
VARIABLE tuning_task VARCHAR2(32);
EXEC :tuning_task := dbms_sqltune.create_tuning_task (sql_id => '7kngmdwtb1dsh');
EXEC dbms_sqltune.execute_tuning_task(task_name => :tuning_task);

SELECT 
    DBMS_SQLTUNE.report_tuning_task (:tuning_task) AS recommendations
FROM
    DUAL;

--
-- Sessions with high I/O Activity
--
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
    username, ses.sid, ses.serial#, ses.sql_id DESC;
    
--
--
--
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
AND a.sql_id = '7kngmdwtb1dsh';
