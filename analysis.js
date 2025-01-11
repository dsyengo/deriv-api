// Function to load the selected HTML file
async function loadFile() {
    const select = document.getElementById("file-select");
    const contentDiv = document.getElementById("content");

    // Clear any existing shadow DOM content
    contentDiv.innerHTML = '';

    // Get the selected file value
    const selectedFile = select.value;

    if (selectedFile) {
        try {
            // Fetch the content of the selected file
            const response = await fetch(selectedFile);

            if (response.ok) {
                // Create a shadow DOM to isolate styles for the content
                const shadowRoot = contentDiv.attachShadow({ mode: 'open' });

                // Fetch the HTML content from the file
                const html = await response.text();
                // Insert the HTML content into the shadow DOM
                shadowRoot.innerHTML = html;
            } else {
                // Show error if the file cannot be loaded
                contentDiv.innerHTML = "<p>Error: Unable to load the selected file.</p>";
            }
        } catch (error) {
            // Show error in case of any issues with the fetch request
            contentDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    } else {
        // Show a message if no file is selected
        contentDiv.innerHTML = "<p>Select a file from the dropdown to view its content.</p>";
    }
}
