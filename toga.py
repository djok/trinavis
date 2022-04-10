import toga


def build(app):
    # build UI
    box = toga.Box('box1')
    pass


if __name__ == '__main__':
    app = toga.App('First App', 'org.beeware.helloworld', startup=build)
    self.app.set_full_screen(self.app.main_window)
    app.main_loop()
