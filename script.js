document.addEventListener("DOMContentLoaded", function () {
  let fileInput = document.getElementById("file-input");
  let fileList = document.getElementById("files-list");
  let numOfFiles = document.getElementById("num-of-files");
  let convertButton = document.getElementById("convert-btn");
  let conversionCountElement = document.getElementById("conversion-count");

  // Load conversion count from localStorage
  let conversionCount = localStorage.getItem("webpToPngCount") || 0;
  conversionCountElement.textContent = `You have converted ${conversionCount} WebP files into PNG files here.`;

  // Update file list display when files are selected
  fileInput.addEventListener("change", () => {
    fileList.innerHTML = "";
    let files = Array.from(fileInput.files).filter(file => file.name.toLowerCase().endsWith(".webp"));
    numOfFiles.textContent = `${files.length} Files Selected`;
    files.forEach(file => {
      let listItem = document.createElement("li");
      let fileName = file.name;
      let fileSize = (file.size / 1024).toFixed(1);
      if (fileSize >= 1024) {
        fileSize = (fileSize / 1024).toFixed(1);
        listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}MB</p>`;
      } else {
        listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}KB</p>`;
      }
      fileList.appendChild(listItem);
    });
  });

  // When the CONVERT button is clicked
  convertButton.addEventListener("click", () => {
    if (fileInput.files.length !== 1) {
      alert("Please select exactly one .webp file for conversion.");
      return;
    }
    let file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith(".webp")) {
      alert("Selected file is not a .webp file.");
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      let dataURL = e.target.result;
      let img = new Image();
      img.onload = function () {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
          let newFileName = file.name.replace(/\.webp$/i, "-processed.png");
          let url = URL.createObjectURL(blob);
          let a = document.createElement("a");
          a.href = url;
          a.download = newFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Increment and update conversion count
          conversionCount++;
          localStorage.setItem("webpToPngCount", conversionCount);
          conversionCountElement.textContent = `You have converted ${conversionCount} WebP files into PNG files here.`;

          // Auto-reload the page after 1 second
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }, "image/png");
      };

      img.onerror = function () {
        alert("Failed to load the image for conversion.");
      };

      img.src = dataURL;
    };

    reader.onerror = function () {
      alert("Failed to read the file.");
    };

    reader.readAsDataURL(file);
  });
});
