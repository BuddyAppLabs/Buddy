import AVKit
import Combine
import Foundation
import MediaPlayer
import OSLog
import SwiftUI

class AppProvider: NSObject, ObservableObject, AVAudioPlayerDelegate, SuperLog {
    @Published var message: String = ""
    @Published var currentTab: ActionTab = (ActionTab(rawValue: AppConfig.currentTab) ?? .Git)
    @Published var sidebarVisibility = AppConfig.sidebarVisibility
    
    func setMessage(_ m: String) {
        message = m
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.message = ""
        }
    }
    
    var emoji = "🏠"
    
    func alert(_ message: String, info: String) {
        // 显示错误提示
        let errorAlert = NSAlert()
        errorAlert.messageText = message
        errorAlert.informativeText = info
        errorAlert.alertStyle = .critical
        errorAlert.addButton(withTitle: "好的")
        errorAlert.runModal()
    }
    
    func setError(_ e: Error) {
        self.alert("发生错误", info: e.localizedDescription)
    }
    
    func setTab(_ t: ActionTab) {
        let verbose = true
        if verbose {
            os_log("\(self.t)Set Tab to \(t.rawValue)")
        }
        
        self.currentTab = t
        AppConfig.setcurrentTab(t)
    }
    
    func hideSidebar() {
        let verbose = true
        if verbose {
            os_log("\(self.t)Hide Siedebar")
        }
        
        self.sidebarVisibility = false
        AppConfig.setSidebarVisibility(false)
    }
    
    func showSidebar() {
        let verbose = false
        if verbose {
            os_log("\(self.t)Show Sidebar")
        }
    
        self.sidebarVisibility = true
        AppConfig.setSidebarVisibility(true)
    }
}

#Preview {
    AppPreview()
        .frame(width: 800)
        .frame(height: 800)
}
