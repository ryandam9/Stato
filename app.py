import copy
import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from flask import Flask
from flask import request, jsonify, render_template
from flask_cors import CORS
from flask_cors import cross_origin
import sys

import cx_Oracle
from flask import jsonify
from oracle_queries import qry

project_location = os.getcwd()

app = Flask(__name__, root_path=project_location )
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config.from_object('settings')
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'images')

# Setup logging
logfile_location = 'logs/web-application-log.log'
log_level = logging.DEBUG
log_format = '%(asctime)s %(levelname)s: [%(filename)s:%(lineno)d] : %(message)s'

logger = logging.getLogger()
handler = RotatingFileHandler(logfile_location, maxBytes=10000000, backupCount=10)
formatter = logging.Formatter(log_format)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(log_level)


def format_data(records):
    if "Exception" not in records[0]:
        data = dict()
        data['columns'] = records.pop(0)
        data['records'] = records

        try:
            json_data = jsonify({
                "status": "success",
                "data": data
            })

            return json_data
        except Exception as err:
            json_data = jsonify({
                "status": "failure",
                "data": str(err)
            })

            return json_data
    else:
        # If there is an exception, Return the Exception.
        json_data = jsonify({
            "status": "failure",
            "data": records[0]
        })

        return json_data


class DBConnection:
    db_connection = None

    # noinspection PyBroadException
    @staticmethod
    def get_db_connection():
        username = app.config['USERNAME']
        password = app.config['PASSWORD']
        endpoint = app.config['ENDPOINT']
        db = app.config['DB']
        port = app.config['PORT']
        connection_string = app.config['CONNECTION_STRING']

        try:
            if len(connection_string.strip()) > 0:
                DBConnection.db_connection = cx_Oracle.connect(username, password, dsn=connection_string)
            else:
                dsn = cx_Oracle.makedsn(host=endpoint, port=port, service_name=db)
                DBConnection.db_connection = cx_Oracle.connect(username, password, dsn, encoding="UTF-8")
        except Exception as err:
            print(err)
            app.logger.error('Unable to get a DB connection to {}'.format(endpoint))
            sys.exit(1)

        return DBConnection.db_connection


# noinspection PyBroadException
def execute_query(query, parameters):
    """
    Executes given SQL query.

    Every time a query is executed, a new DB connection is acquired and closed after the query is executed.
    This is not really a good idea, but there is a reason for doing this way.

    Using Connection pooling might be a good idea (However, I am not sure how to use them). Query requests from
    client come at any time and they're are concurrent.

    :return  A List of lists, where each list is a record. First list is the column names.
    """
    connection = DBConnection.get_db_connection()
    app.logger.debug('-' * 120)
    app.logger.debug('Query to be executed')
    app.logger.debug(query)
    app.logger.debug('Query Parameters: {}'.format(parameters))

    records = []  # Query results
    try:
        cur = connection.cursor()

        if parameters is None:
            cur.execute(query)
        else:
            cur.execute(query, parameters)

        # Get Column names
        field_names = [i[0].upper() for i in cur.description]
        records.append(field_names)

        # Process all the records
        for record in cur:
            rec = []

            # SQL Query result can contain different types of data - Int, Char, Decimal, CLOB, etc.
            # Converting all types to Char so that, when preparing JSON format, there won't be any
            # errors.
            for i in range(len(record)):
                string_value = ''
                try:
                    string_value = str(record[i]) if record[i] is not None else ''
                except Exception as error:
                    print('Unable to convert value to String; value: {}'.format(record[i]))

                rec.append(string_value)
            records.append(rec)
        cur.close()
    except Exception as err:
        # A SQL Query could fail due to any number of reasons. Syntax could be wrong, Database could be down,
        # the User may not have required privileges to execute the query, No Temporary table space, no CPU
        # availability, to name a few. In such cases, Return the Exception.
        app.logger.error(err)
        records.append("Exception: " + str(err))
    finally:
        connection.close()

    app.logger.debug('Sample Result')
    [app.logger.debug(rec) for index, rec in enumerate(records) if index < 5]

    return records


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/report_sql_monitor/<string:sql_id>', methods=['GET'])
def report_sql_monitor(sql_id):
    query = 'SELECT DBMS_SQLTUNE.REPORT_SQL_MONITOR(' + "'" + sql_id + "')" + ' FROM DUAL'
    app.logger.debug(query)

    records = execute_query(query, None)

    # Data of this query is a LOB Object. Convert it to a String first.
    result = convert_lob_object_to_string(records[1][0])

    records = [['STATUS'], [result]]
    result = format_data(records)
    return result, 201


@app.route('/report_sql_monitor_active/<string:sql_id>', methods=['GET'])
def report_sql_monitor_active(sql_id):
    query = 'SELECT DBMS_SQLTUNE.REPORT_SQL_MONITOR(' + "'" + sql_id + "'," \
            + "type => 'active', report_level => 'ALL') FROM DUAL"

    app.logger.debug(query)
    records = execute_query(query, None)

    # Data of this query is a LOB Object. Convert it to a String first.
    result = convert_lob_object_to_string(records[1][0])
    return result, 201


def convert_lob_object_to_string(lob_object):
    # Create a temp file
    filename = 'temp.txt'

    # Write the contents of the LOB Object to a file
    temp = open(filename, 'w')
    print(lob_object, file=temp)
    temp.close()

    # Read the temp file
    temp = open(filename, 'r')
    result = ""

    # Read all the lines
    for line in temp:
        result += line

    temp.close()

    return result


@app.route('/get_query_map')
@cross_origin()
def get_query_map():
    config_data = dict()
    copy_of_qry = copy.deepcopy(qry)

    for key in copy_of_qry.keys():
        formatted_key = key.replace(' ', '-').lower().strip()
        config_data[formatted_key] = copy_of_qry[key]

        # Add a new attribute the object
        config_data[formatted_key]['queryId'] = formatted_key

        # Remove attributes that are not needed for frontend.
        config_data[formatted_key].pop('query', None)

    return jsonify(config_data)


@app.route('/get-table/<string:table>', methods=['GET', 'POST'])
@cross_origin()
def get_table(table):
    query = 'SELECT * FROM ' + table + ' WHERE ROWNUM < 25000'
    records = execute_query(query, [])
    result = format_data(records)
    return result, 201


@app.route('/get-list-of-data-dictionary-tables', methods=['GET'])
def get_list_of_data_dictionary_tables():
    query = qry['data-dictionary-views']
    records = execute_query(query, [])
    result = format_data(records)
    return result


@app.route('/query_execution/<string:query_id>', methods=['GET', 'POST'])
@cross_origin()
def query_execution(query_id):
    parameter_names = list(request.args)
    parameter_values = list()
    [parameter_values.append(request.args[parm]) for parm in parameter_names]

    app.logger.debug('Query parameters for {}: '.format(query_id))
    app.logger.debug('Parameter names        : {}'.format(parameter_names))
    app.logger.debug('Parameter values       : {}'.format(parameter_values))

    # Holds Query results
    records = list()
    parameters = []

    if len(parameter_values) == 0:
        parameters = None
    else:
        parameters = parameter_values

    if query_id in qry.keys():
        query = qry[query_id]['query']
        records = execute_query(query, parameters)
    else:
        records.append('Exception: ' + query_id + ' not found in list of configured queries')

    # Format Query results in JSON form.
    result = format_data(records)
    return result, 201


@app.route('/execute_custom_sql', methods=['POST', 'OPTIONS'])
@cross_origin()
def execute_custom_sql():
    payload = request.json
    sql_text = payload['query']

    records = execute_query(sql_text, None)
    result = format_data(records)
    return result, 201


if __name__ == '__main__':
    print(sys.path)
    print('Inside app.py')
    print('Instance Path', app.instance_path)
    print('Root Path', app.root_path)
    app.run()
