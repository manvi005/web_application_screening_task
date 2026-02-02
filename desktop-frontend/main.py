import sys
import requests
import json
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                             QFileDialog, QTabWidget, QTableWidget, QTableWidgetItem, QMessageBox,
                             QListWidget)
from PyQt5.QtCore import Qt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import base64

API_URL = "http://localhost:8000/api/"

STYLE_SHEET = """
QMainWindow, QWidget {
    background-color: #2b2b2b;
    color: #ffffff;
}
QLineEdit {
    padding: 8px;
    border: 1px solid #555;
    border-radius: 4px;
    background: #3b3b3b;
    color: white;
}
QPushButton {
    background-color: #0d6efd;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
}
QPushButton:hover {
    background-color: #0b5ed7;
}
QListWidget {
    background-color: #3b3b3b;
    border: 1px solid #555;
    border-radius: 4px;
    color: white;
}
QTableWidget {
    background-color: #3b3b3b;
    gridline-color: #555;
    color: white;
}
QHeaderView::section {
    background-color: #4b4b4b;
    padding: 4px;
    border: 1px solid #555;
    color: white;
}
"""

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Login")
        self.setGeometry(300, 300, 300, 200)
        self.setStyleSheet(STYLE_SHEET)
        
        layout = QVBoxLayout()
        
        self.username = QLineEdit()
        self.username.setPlaceholderText("Username")
        layout.addWidget(self.username)
        
        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.Password)
        layout.addWidget(self.password)
        
        self.btn_login = QPushButton("Login")
        self.btn_login.clicked.connect(self.check_login)
        layout.addWidget(self.btn_login)
        
        self.setLayout(layout)
        
    def check_login(self):
        # Basic check, real check happens on first API call usually or we can just try to list datasets
        user = self.username.text()
        pwd = self.password.text()
        auth = requests.auth.HTTPBasicAuth(user, pwd)
        
        try:
            # Try to list datasets to verify auth
            r = requests.get(API_URL + "datasets/", auth=auth)
            if r.status_code == 200:
                self.main = MainWindow(auth)
                self.main.show()
                self.close()
            else:
                QMessageBox.warning(self, "Error", "Invalid Credentials")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Connection failed: {str(e)}")

class MainWindow(QMainWindow):
    def __init__(self, auth):
        super().__init__()
        self.auth = auth
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setGeometry(100, 100, 1200, 800)
        self.setStyleSheet(STYLE_SHEET)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        
        # Sidebar with Upload and History
        sidebar = QVBoxLayout()
        self.btn_upload = QPushButton("Upload CSV")
        self.btn_upload.clicked.connect(self.upload_file)
        sidebar.addWidget(self.btn_upload)
        
        sidebar.addWidget(QLabel("History:"))
        self.history_list = QListWidget()
        self.history_list.itemClicked.connect(self.load_dataset_stats)
        sidebar.addWidget(self.history_list)

        self.btn_pdf = QPushButton("Download Report")
        self.btn_pdf.clicked.connect(self.download_report)
        sidebar.addWidget(self.btn_pdf)

        main_layout.addLayout(sidebar, 1)
        
        # Main Content Area
        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs, 4)
        
        self.dashboard_tab = QWidget()
        self.create_dashboard_ui()
        self.tabs.addTab(self.dashboard_tab, "Dashboard")
        
        self.data_tab = QWidget()
        self.data_table = QTableWidget()
        data_layout = QVBoxLayout()
        data_layout.addWidget(self.data_table)
        self.data_tab.setLayout(data_layout)
        self.tabs.addTab(self.data_tab, "Raw Data")
        
        self.current_dataset_id = None
        self.refresh_history()

    def create_dashboard_ui(self):
        layout = QVBoxLayout()
        # Summary Header
        self.lbl_summary = QLabel("Select a dataset to view stats")
        layout.addWidget(self.lbl_summary)
        
        # Charts
        self.figure = Figure(figsize=(5, 4), dpi=100, facecolor='#2b2b2b')
        self.canvas = FigureCanvas(self.figure)
        layout.addWidget(self.canvas)
        
        self.dashboard_tab.setLayout(layout)

    def refresh_history(self):
        try:
            r = requests.get(API_URL + "datasets/", auth=self.auth)
            if r.status_code == 200:
                data = r.json()
                self.history_list.clear()
                for d in data:
                    item_text = f"Dataset {d['id']} - {d['uploaded_at']}"
                    self.history_list.addItem(item_text)
                    # Storing ID in user role or just retrieving from text logic for simplicity
                    self.history_list.item(self.history_list.count()-1).setData(Qt.UserRole, d['id'])
                
                # Load latest if available
                if data and not self.current_dataset_id:
                     self.load_dataset_stats(self.history_list.item(0))

        except Exception as e:
            print(e)

    def upload_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, 'Open CSV', '.', "CSV Files (*.csv)")
        if fname:
            try:
                files = {'file': open(fname, 'rb')}
                r = requests.post(API_URL + "datasets/", files=files, auth=self.auth)
                if r.status_code == 201:
                    QMessageBox.information(self, "Success", "Upload Successful")
                    self.refresh_history()
                else:
                    QMessageBox.warning(self, "Error", "Upload Failed")
            except Exception as e:
                QMessageBox.critical(self, "Error", str(e))

    def load_dataset_stats(self, item):
        dataset_id = item.data(Qt.UserRole)
        self.current_dataset_id = dataset_id
        
        try:
            r = requests.get(API_URL + f"datasets/{dataset_id}/stats/", auth=self.auth)
            if r.status_code == 200:
                stats = r.json()
                self.update_ui(stats)
        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))

    def update_ui(self, stats):
        # Summary
        self.lbl_summary.setText(f"Total: {stats['total_count']} | Avg Temp: {stats['average_temperature']:.2f}")
        
        # Charts
        self.figure.clear()
        
        # Subplot 1: Distribution
        ax1 = self.figure.add_subplot(121)
        ax1.set_facecolor('#2b2b2b')
        labels = list(stats['type_distribution'].keys())
        sizes = list(stats['type_distribution'].values())
        wedges, texts, autotexts = ax1.pie(sizes, labels=labels, autopct='%1.1f%%', 
                                           textprops={'color':"w"})
        ax1.set_title("Equipment Type", color='white')
        
        # Subplot 2: Flowrate vs Pressure
        ax2 = self.figure.add_subplot(122)
        ax2.set_facecolor('#2b2b2b')
        ax2.tick_params(colors='white')
        for spine in ax2.spines.values():
            spine.set_color('white')

        names = [d['Equipment Name'] for d in stats['data']]
        flow = [d['Flowrate'] for d in stats['data']]
        pressure = [d['Pressure'] for d in stats['data']]
        
        x = range(len(names))
        ax2.plot(x, flow, label='Flowrate', color='#38bdf8')
        ax2.set_ylabel('Flowrate', color='#38bdf8')
        
        ax2_b = ax2.twinx()
        ax2_b.tick_params(colors='white')
        for spine in ax2_b.spines.values():
            spine.set_color('white')
            
        ax2_b.plot(x, pressure, label='Pressure', color='#f472b6')
        ax2_b.set_ylabel('Pressure', color='#f472b6')
        
        ax2.set_title("Flowrate/Pressure", color='white')
        
        self.canvas.draw()
        
        # Table
        self.data_table.setRowCount(len(stats['data']))
        self.data_table.setColumnCount(5)
        self.data_table.setHorizontalHeaderLabels(['Name', 'Type', 'Flow', 'Press', 'Temp'])
        
        for i, row in enumerate(stats['data']):
             self.data_table.setItem(i, 0, QTableWidgetItem(str(row['Equipment Name'])))
             self.data_table.setItem(i, 1, QTableWidgetItem(str(row['Type'])))
             self.data_table.setItem(i, 2, QTableWidgetItem(str(row['Flowrate'])))
             self.data_table.setItem(i, 3, QTableWidgetItem(str(row['Pressure'])))
             self.data_table.setItem(i, 4, QTableWidgetItem(str(row['Temperature'])))

    def download_report(self):
        if not self.current_dataset_id:
            return
        try:
            r = requests.get(API_URL + f"datasets/{self.current_dataset_id}/report/", auth=self.auth)
            if r.status_code == 200:
                path, _ = QFileDialog.getSaveFileName(self, "Save PDF", f"report_{self.current_dataset_id}.pdf", "PDF Files (*.pdf)")
                if path:
                    with open(path, 'wb') as f:
                        f.write(r.content)
                    QMessageBox.information(self, "Success", "Report Saved")
        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))

if __name__ == '__main__':
    app = QApplication(sys.argv)
    login = LoginWindow()
    login.show()
    sys.exit(app.exec_())
