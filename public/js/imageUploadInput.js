const imageUploaderInput = document.querySelector('#imageUploaderInput');
const container = document.querySelector('#imageUploadContainer');

function convertFileSize(fileSize) {

}

function appendHTMLElement(thumbnailContent, fileName, fileSize) {
    let card = document.createElement('div');
    let content = `<div class="card mb-3" style="overflow: hidden;">
    <div class="row g-0">
            <div class="col-auto" id="uploadedImage">
                <img src="${thumbnailContent}" alt="Image">
            </div>
            <div class="col p-2">
                <h5 class="card-title">${fileName}</h5>
                <p class="card-text"><small class="text-body-secondary">${fileSize}</small></p>
            </div>
        </div>
    </div>`;
    card.innerHTML = content;
    // Append newly created card section to the initially empty container
    container.appendChild(card);
}

function createHTMLElement(file, fileName, fileSize) {
    // Show thumbnail image
    let thumbnailContent;
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            thumbnailContent = e.target.result;
            appendHTMLElement(thumbnailContent, fileName, fileSize);
        };
        reader.readAsDataURL(file);
    } else {
        thumbnailContent = '';
        appendHTMLElement(thumbnailContent, fileName, fileSize);
    }
}

imageUploaderInput.addEventListener('change', () => {
    for (let file of imageUploaderInput.files) {
        // console.log(file, file.name, file.size);
        // Create the card section
        createHTMLElement(file, file.name, file.size);
    }
})
