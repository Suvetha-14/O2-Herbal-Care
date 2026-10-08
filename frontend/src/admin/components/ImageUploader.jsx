import { useState } from 'react'

export default function ImageUploader({ onImagesChange, initialImages = [] }) {
  const [images, setImages] = useState(initialImages)
  const [previews, setPreviews] = useState(initialImages)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    let loadedCount = 0

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages((prev) => {
          const updated = [...prev, event.target.result]
          loadedCount++
          // Only call parent callback after all files are loaded
          if (loadedCount === files.length) {
            onImagesChange(updated)
          }
          return updated
        })
        setPreviews((prev) => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setImages(updatedImages)
    setPreviews(updatedPreviews)
    onImagesChange(updatedImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

      {/* Preview */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-gray-600 font-medium">Click to upload images</p>
          <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 5MB</p>
        </label>
      </div>
    </div>
  )
}
