from flask_script import Manager, Server

from app import app

manager = Manager(app)


manager.add_command("runserver", Server(
    use_debugger=True,
    use_reloader=True,
    host='127.0.0.1',
    port=8080
))

if __name__ == '__main__':
    app.logger.info("Application is getting started.")
    app.logger.info("App Instance Path:" + app.instance_path)
    print(app.instance_path)
    manager.run()
