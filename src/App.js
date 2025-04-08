import './App.css';
import { useState, useRef } from 'react';
import JSZip from 'jszip';

function App() {
  const [imageFiles, setImageFiles] = useState([]);
  const [renamedImages, setRenamedImages] = useState([]);
  const [prefix, setPrefix] = useState('BR793'); // State for user-defined prefix
  const [previewImage, setPreviewImage] = useState(null); // State for preview image
  const fileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('');


  const predefinedNames = [
    'em-rg-ang1', 'em-wg-ang1', 'em-yg-ang1', 'em-rg-ang2', 'em-wg-ang2', 'em-yg-ang2', 'em-rg-ang3', 'em-wg-ang3', 'em-yg-ang3', 'em-rg-ang4', 'em-wg-ang4', 'em-yg-ang4',
    'ht-rg-ang1', 'ht-wg-ang1', 'ht-yg-ang1', 'ht-rg-ang2', 'ht-wg-ang2', 'ht-yg-ang2', 'ht-rg-ang3', 'ht-wg-ang3', 'ht-yg-ang3', 'ht-rg-ang4', 'ht-wg-ang4', 'ht-yg-ang4',
    'mq-rg-ang1', 'mq-wg-ang1', 'mq-yg-ang1', 'mq-rg-ang2', 'mq-wg-ang2', 'mq-yg-ang2', 'mq-rg-ang3', 'mq-wg-ang3', 'mq-yg-ang3', 'mq-rg-ang4', 'mq-wg-ang4', 'mq-yg-ang4',
    'ov-rg-ang1', 'ov-wg-ang1', 'ov-yg-ang1', 'ov-rg-ang2', 'ov-wg-ang2', 'ov-yg-ang2', 'ov-rg-ang3', 'ov-wg-ang3', 'ov-yg-ang3', 'ov-rg-ang4', 'ov-wg-ang4', 'ov-yg-ang4',
    'pr-rg-ang1', 'pr-wg-ang1', 'pr-yg-ang1', 'pr-rg-ang2', 'pr-wg-ang2', 'pr-yg-ang2', 'pr-rg-ang3', 'pr-wg-ang3', 'pr-yg-ang3', 'pr-rg-ang4', 'pr-wg-ang4', 'pr-yg-ang4',
    'ps-rg-ang1', 'ps-wg-ang1', 'ps-yg-ang1', 'ps-rg-ang2', 'ps-wg-ang2', 'ps-yg-ang2', 'ps-rg-ang3', 'ps-wg-ang3', 'ps-yg-ang3', 'ps-rg-ang4', 'ps-wg-ang4', 'ps-yg-ang4',
    'rd-rg-ang1', 'rd-wg-ang1', 'rd-yg-ang1', 'rd-rg-ang2', 'rd-wg-ang2', 'rd-yg-ang2', 'rd-rg-ang3', 'rd-wg-ang3', 'rd-yg-ang3', 'rd-rg-ang4', 'rd-wg-ang4', 'rd-yg-ang4',
  ];

  // Display uploaded images
  const displayImages = (event) => {
    const files = Array.from(event.target.files);
    setImageFiles((prevFiles) => [...prevFiles, ...files]); // Append new files to existing ones
  };

  // Handle renaming images dynamically
  const handleNameChange = (index, newName) => {
    setRenamedImages((prevRenamedImages) => {
      const updatedRenamedImages = [...prevRenamedImages];

      updatedRenamedImages[index] = {
        oldFile: imageFiles[index], // Ensure oldFile is included
        newFileName: `${newName}.${imageFiles[index].name.split('.').pop()}`,
      };

      return updatedRenamedImages;
    });
  };


  // Rename images and create download links
  const renameImages = () => {
    const renamed = imageFiles.map((file, index) => {
      const selectedName = document.getElementById(`select-${index}`).value;
      if (!selectedName) {
        alert(`Please select a name for ${file.name}`);
        return null;
      }
      return {
        oldFile: file, // Ensure oldFile is stored
        newFileName: `${selectedName}.${file.name.split('.').pop()}`,
      };
    });

    setRenamedImages(renamed.filter(Boolean)); // Remove null entries
  };

  // Remove image based on index
  const removeImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setRenamedImages((prevRenamedImages) => prevRenamedImages.filter((_, i) => i !== index));
  };

  // Handle downloading renamed images
  const handleDownload = (file, fileName) => {
    if (!file) {
      alert("File not found. Please ensure the images are renamed properly.");
      return;
    }

    const blob = new Blob([file], { type: file.type });
    const fileURL = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    link.click();
  };


  const getDropdownName = () => {
    return predefinedNames
      .filter(name => selectedCategory ? name.startsWith(selectedCategory) : true)
      .map(name => `${prefix}-${name}`);
  };

  const downloadAllAsZip = async () => {
    if (!renamedImages || renamedImages.length === 0) {
      alert("No images to zip. Please rename images first.");
      return;
    }



    const zip = new JSZip();
    const fileReadPromises = renamedImages.map((renamedImage) => {
      return new Promise((resolve, reject) => {
        const file = renamedImage.oldFile;
        const newFileName = renamedImage.newFileName;
        const reader = new FileReader();

        reader.onload = (event) => {
          zip.file(newFileName, event.target.result); // Add file to ZIP
          resolve(); // Resolve once the file is added
        };

        reader.onerror = (error) => reject(error); // Handle errors
        reader.readAsArrayBuffer(file); // Read file as binary data
      });
    });

    try {
      await Promise.all(fileReadPromises); // Wait for all files to be added
      const content = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "renamed_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("An error occurred while creating the ZIP file.");
    }
  };




  // Update the prefix value when the user types a new prefix
  const handlePrefixChange = (e) => {
    setPrefix(e.target.value);
  };

  // Generate the dropdown names dynamically based on the prefix
  const getDropdownNames = () => {
    return predefinedNames.map((name) => `${prefix}-${name}`);
  };

  // Open the preview modal for a specific image
  const openPreview = (imageFile) => {
    setPreviewImage(URL.createObjectURL(imageFile));
  };

  // Close the preview modal
  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <div className="container">
        <h1 className="title">Image Renaming Tool</h1>
        <div className="upload-section">
          <div className="upload-box">
            <h2>Upload Images</h2>

            <input
              type="file"
              onChange={displayImages}
              multiple
              ref={fileInputRef}
              className="file-input"
            />

            <div className="prefix-input">
              <h2>Set Prefix</h2>
              <input
                type="text"
                value={prefix}
                onChange={handlePrefixChange}
                placeholder="Enter prefix"
                className="prefix-input-field"
              />
            </div>

            <div className="category-filter">
              <h2>Select Filter Category</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-dropdown"
              >
                <option value="">All</option>
                <option value="em">Emerald (em)</option>
                <option value="rd">Round (rd)</option>
                <option value="ps">Princess (ps)</option>
                <option value="mq">Marquise (mq)</option>
                <option value="ov">Oval (ov)</option>
                <option value="pr">Pear Shape (pr)</option>
                <option value="ht">Heart (ht)</option>
              </select>
            </div>

            {imageFiles.length > 0 && (
              <button onClick={() => fileInputRef.current.click()} className="add-more-btn">
                Add More Images
              </button>
            )}
          </div>

          <div className="rename-box">
            <h2>Rename Images</h2>
            <div className="image-list">
              {imageFiles.map((file, index) => (
                <div className="image-item" key={index}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="image-preview"
                    onClick={() => openPreview(file)}
                  />
                  <select
                    id={`select-${index}`}
                    value={renamedImages[index]?.newFileName?.split('.')[0] || ''}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="rename-dropdown"
                  >
                    <option value="">Select a name</option>
                    {getDropdownName().map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <div className='old-and-new-naming'>
                    <p className='old-new-name'><b>Old Name:</b><br /> {file.name}</p>
                    <p className='old-new-name'><b>New Name:</b><br /> {renamedImages[index]?.newFileName || 'Not renamed yet'}</p>
                  </div>
                  <button onClick={() => removeImage(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className='convert-download-button'>
              <button onClick={renameImages} className="convert-btn">Convert and Download</button>
            </div>
          </div>
        </div>

        {renamedImages.length > 0 && (
          <div className="download-section">
            <h2>Download Renamed Images</h2>
            <div className='download-button-grid'>
              {renamedImages.map((renamedImage, index) => (

                <div className="download-item" key={index}>
                  <button
                    onClick={() =>
                      handleDownload(renamedImage.oldFile, renamedImage.newFileName)
                    }
                    className="download-btn"
                  >
                    {renamedImage.newFileName}
                  </button>
                </div>

              ))}
            </div>
            <button onClick={downloadAllAsZip} className="download-zip-btn">
              Download All as ZIP
            </button>
          </div>
        )}

        {previewImage && (
          <div className="preview-modal" onClick={closePreview}>
            <div className="preview-content">
              <img src={previewImage} alt="Preview" className="large-preview-image" />
              <button className="close-preview-btn" onClick={closePreview}>X</button>
            </div>
          </div>
        )}

      </div>
    </>


  );
}

export default App;
