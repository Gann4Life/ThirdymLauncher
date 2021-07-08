from kivy.app import App
from kivy.uix.screenmanager import Screen, ScreenManager
from kivy.properties import ObjectProperty
from kivy.lang import Builder

from time import sleep
from threading import Thread
import random
import requests

class MainWindow(Screen):
    pass

class DownloadWindow(Screen):
    progressBar = ObjectProperty(None)
    progressText = ObjectProperty(None)
    backButton = ObjectProperty(None)

    download_thread = Thread()

    def display_progress(self, total, current): # In bytes
        current_mb = round(current/1024/1024, 1)
        total_mb = round(total/1024/1024, 1)
        

        string = f"Downloading {current_mb}mb of {total_mb}mb"

        self.progressText.text = string
        
    def progress(self):
        self.backButton.disabled = True
        url = "https://download939.mediafire.com/k5fpolb08sag/vk3ubbajeidpjyf/Thirdym+v0.0.4-alpha.rar"
        r = requests.get(url, stream=True)
        with open("ThirdymGame.rar", "wb") as f:
            total_progress = int(r.headers.get("content-length"))
            progress = 0
            for chunk in r.iter_content(chunk_size=1024):
                f.write(chunk)
                f.flush()

                progress += len(chunk)

                self.progressBar.value = progress/total_progress*100
                self.display_progress(total_progress, progress)

        self.backButton.disabled = False


    def begin_download(self):
        print("Downloading ...")
        self.download_thread = Thread(target=self.progress, daemon=True).start()

    def cancel_download(self):
        print("Download cancelled.")
        self.progressBar.value = 0
        self.progressText.text = "Waiting for a request..."
        



class WindowManager(ScreenManager):
    pass

kv = Builder.load_file("style.kv")

class GannLauncherApp(App):
    def build(self):
        return kv

if __name__ == "__main__":
    GannLauncherApp().run()