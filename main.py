from kivy.app import App
from kivy.uix.screenmanager import Screen, ScreenManager
from kivy.properties import ObjectProperty
from kivy.lang import Builder

from time import sleep
from threading import Thread
import random

class MainWindow(Screen):
    pass

class DownloadWindow(Screen):
    progressBar = ObjectProperty(None)
    progressText = ObjectProperty(None)
    backButton = ObjectProperty(None)

    download_thread = Thread()

    def display_progress(self):
        self.progressText.text = str(self.progressBar.value) + "%"
        
    def progress(self):
        self.backButton.disabled = True
        while self.progressBar.value < 100:
            sleep(0.1)
            self.progressBar.value += random.randrange(0, 10)
            self.display_progress()
        else:
            self.backButton.disabled = False

    def begin_download(self):
        print("Downloading ...")
        self.download_thread = Thread(target=self.progress, daemon=True).start()

    def cancel_download(self):
        print("Download cancelled.")
        self.progressBar.value = 0
        self.display_progress()
        



class WindowManager(ScreenManager):
    pass

kv = Builder.load_file("style.kv")

class GannLauncherApp(App):
    def build(self):
        return kv

if __name__ == "__main__":
    GannLauncherApp().run()