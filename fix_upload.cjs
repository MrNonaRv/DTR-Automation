const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandleUpload = `  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-attendance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const formattedData = result.data.map((emp: EmployeeAttendance) => ({
        ...emp,
        employeeIdOrName: toTitleCase(emp.employeeIdOrName)
      }));
      setParsedData(formattedData);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };`;

const newHandleUpload = `  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-attendance', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        let errMsg = 'Expected JSON but got HTML. ';
        if (text.includes('<!DOCTYPE') || text.includes('<!doctype')) {
            errMsg += 'The server returned an HTML page (possibly a redirect or an unhandled proxy error). ';
        }
        errMsg += \`Status: \${response.status}. \${text.substring(0, 50)}\`;
        throw new Error(errMsg);
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || 'Upload failed');
      }

      const result = await response.json();
      const formattedData = result.data.map((emp: EmployeeAttendance) => ({
        ...emp,
        employeeIdOrName: toTitleCase(emp.employeeIdOrName)
      }));
      setParsedData(formattedData);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };`;

content = content.replace(oldHandleUpload, newHandleUpload);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed');
