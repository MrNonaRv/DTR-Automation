const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<button\s+onClick=\{\(\) => \{\s+const shareUrl = [^<]+<svg[^<]+<\/svg>\s+Copy Sync Link\s+<\/button>/g;

const newCode = code.replace(regex, '');

if (code !== newCode) {
    fs.writeFileSync('src/App.tsx', newCode);
    console.log('Sync link removed successfully.');
} else {
    console.log('Could not find sync link block with regex. Using string replace.');
    
    // Fallback string replacement
    const exactStr = `                    <button 
                      onClick={() => {
                        const shareUrl = \`\${window.location.origin}\${window.location.pathname}?session=\${currentSessionId}\`;
                        navigator.clipboard.writeText(shareUrl);
                        setToast({ message: "Sync Link copied to clipboard! Open this link on your other device.", type: "success" });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-blue-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      Copy Sync Link
                    </button>`;
                    
    const fallbackCode = code.replace(exactStr, '');
    fs.writeFileSync('src/App.tsx', fallbackCode);
    console.log('Sync link removed via fallback.');
}
