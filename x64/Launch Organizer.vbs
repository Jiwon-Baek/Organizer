Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

folderPath = fso.GetParentFolderName(WScript.ScriptFullName)
rootPath = fso.GetParentFolderName(folderPath)
shell.CurrentDirectory = rootPath

If fso.FileExists(rootPath & "\node_modules\.bin\electron.cmd") Then
  shell.Run """" & folderPath & "\Launch Organizer.bat""", 0, False
Else
  shell.Run """" & folderPath & "\Install Organizer Windows Dependencies.bat""", 1, False
End If
