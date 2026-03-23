# Generate proper iOS Shortcut using Apple's format
.PHONY: all clean

all: IntermezzoFact iCloud-link

# Create the shortcut properly formatted for iOS 15+
IntermezzoFact:
	@echo "Creating iOS Shortcut..."
	@cat > IntermezzoFact.shortcut << 'SHORTCUT_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>WFWorkflowActions</key>
	<array>
		<dict>
			<key>WFWorkflowActionIdentifier</key>
			<string>com.apple.WorkflowCore.GetURLContents</string>
			<key>WFWorkflowActionParameters</key>
			<dict>
				<key>URL</key>
				<string>https://gustavoibenc.github.io/intermezzos/intermezzos.json</string>
			</dict>
		</dict>
		<dict>
			<key>WFWorkflowActionIdentifier</key>
			<string>com.apple.WorkflowCore.ParseJSON</string>
			<key>WFWorkflowActionParameters</key>
			<dict/>
		</dict>
		<dict>
			<key>WFWorkflowActionIdentifier</key>
			<string>com.apple.WorkflowCore.GetItemFromList</string>
			<key>WFWorkflowActionParameters</key>
			<dict>
				<key>Index</key>
				<integer>0</integer>
			</dict>
		</dict>
		<dict>
			<key>WFWorkflowActionIdentifier</key>
			<string>com.apple.WorkflowCore.GetValueForKey</string>
			<key>WFWorkflowActionParameters</key>
			<dict>
				<key>Key</key>
				<string>fact</string>
			</dict>
		</dict>
		<dict>
			<key>WFWorkflowActionIdentifier</key>
			<string>com.apple.WorkflowCore.ShowResult</string>
			<key>WFWorkflowActionParameters</key>
			<dict/>
		</dict>
	</array>
	<key>WFWorkflowClassificationType</key>
	<integer>2</integer>
	<key>WFWorkflowName</key>
	<string>Intermezzo Fact</string>
	<key>WFWorkflowIcon</key>
	<dict>
		<key>WFWorkflowIconGlyphNumber</key>
		<integer>61473</integer>
		<key>WFWorkflowIconStartColor</key>
		<integer>4281667585</integer>
	</dict>
	<key>WFWorkflowTypes</key>
	<array>
		<string>Widget</string>
	</array>
</dict>
</plist>
SHORTCUT_EOF
	@echo "✅ Created IntermezzoFact.shortcut"

iCloud-link: IntermezzoFact
	@echo ""
	@echo "📲 TO GET ICLOUD LINK:"
	@echo "1. Email this file to yourself OR use AirDrop"
	@echo "2. Open on iPhone → Tap Share → 'Copy iCloud Link'"
	@echo "3. Send link to Gustavo → He'll add it to website"
	@echo ""
	@echo "OR just use the manual 3-step method (easiest for now):"
	@echo "   https://gustavoibenc.github.io/intermezzos/widget-qr.html"

clean:
	rm -f IntermezzoFact.shortcut
