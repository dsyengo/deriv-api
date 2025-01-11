// Function to load the selected HTML file
async function loadFile() {
    const select = document.getElementById("file-select");
    const contentDiv = document.getElementById("content");

    // Clear any existing content
    contentDiv.innerHTML = '';

    // Get the selected file value
    const selectedFile = select.value;
    console.log("Selected file: ", selectedFile);

    if (selectedFile) {
        // Create an iframe element
        const iframe = document.createElement('iframe');
        iframe.style.width = '100vw';  // Set width to 100% for full-width display
        iframe.style.height = '100vh';  // Set a default height for the iframe
        iframe.src = selectedFile;  // Set the src to the selected file

        // Append the iframe to the content div
        contentDiv.appendChild(iframe);
    } else {
        // Show a message if no file is selected
        contentDiv.innerHTML = "<p>Select a file from the dropdown to view its content.</p>";
    }
}
