import { useState } from 'react'
import ImageUploader from './ImageUploader'

export default function ProductForm({ initialData = null, onSubmit, loading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      category: 'Herbal Soap',
      price: '',
      discountPrice: '',
      stock: '',
      order: 0,
      description: '',
      ingredients: [],
      skinType: [],
      hairType: [],
      images: [],
      isActive: true,
    }
  )

  const [ingredientInput, setIngredientInput] = useState('')

  const categories = [
    'Herbal Soap',
    'Herbal Shampoo',
    'Hair Oil',
    'Face & Hair Gel',
    'Moisturizer Cream',
    'Lip Balm',
    'Face Serum',
  ]
  const skinTypes = ['Dry', 'Oily', 'Normal', 'Sensitive', 'Combination']
  const hairTypes = ['Dry', 'Oily', 'Normal', 'Curly', 'Straight', 'Wavy']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput],
      }))
      setIngredientInput('')
    }
  }

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const handleImagesChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
          <input
            type="number"
            name="discountPrice"
            value={formData.discountPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
        </div>
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
        <input
          type="number"
          name="order"
          value={formData.order}
          onChange={handleChange}
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter product description"
        />
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Add ingredient and press Enter"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="font-bold hover:opacity-70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skin Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Suitable for Skin Types</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {skinTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.skinType.includes(type)}
                onChange={() => handleMultiSelect('skinType', type)}
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hair Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Suitable for Hair Types</label>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {hairTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hairType.includes(type)}
                onChange={() => handleMultiSelect('hairType', type)}
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <ImageUploader onImagesChange={handleImagesChange} initialImages={formData.images} />

      {/* Active Status */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-green-600"
        />
        <span className="text-sm font-medium text-gray-700">Product Active</span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
      >
        {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}
