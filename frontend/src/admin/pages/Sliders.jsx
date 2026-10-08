import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import useToast from '../hooks/useToast'
import { Toast, EmptyState, LoadingSpinner } from '../components/Common'
import { getAllSliders, createSlider, updateSlider, deleteSlider } from '../services/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function Sliders() {
  const { admin, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [sliders, setSliders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', image: '' })
  const [isEditing, setIsEditing] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  // Fetch sliders on mount
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin')
      return
    }
    if (!loading && admin) {
      fetchSliders()
    }
  }, [loading, admin, navigate])

  const fetchSliders = async () => {
    try {
      setIsLoading(true)
      const response = await getAllSliders()
      if (response.data.success) {
        setSliders(response.data.sliders)
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch sliders', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.image) {
      addToast('Please fill all fields', 'error')
      return
    }

    try {
      setSubmitting(true)

      if (isEditing) {
        const response = await updateSlider(isEditing, {
          title: formData.title,
          description: formData.description,
          image: formData.image,
        })

        if (response.data.success) {
          setSliders(sliders.map((s) => (s._id === isEditing ? response.data.slider : s)))
          addToast('Slider updated successfully', 'success')
          setIsEditing(null)
        }
      } else {
        const response = await createSlider({
          title: formData.title,
          description: formData.description,
          image: formData.image,
        })

        if (response.data.success) {
          setSliders([...sliders, response.data.slider])
          addToast('Slider created successfully', 'success')
        }
      }

      setFormData({ title: '', description: '', image: '' })
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save slider', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (slider) => {
    setFormData({
      title: slider.title,
      description: slider.description,
      image: slider.image,
    })
    setIsEditing(slider._id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) {
      return
    }

    try {
      const response = await deleteSlider(id)

      if (response.data.success) {
        setSliders(sliders.filter((s) => s._id !== id))
        addToast('Slider deleted successfully', 'success')
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete slider', 'error')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ title: '', description: '', image: '' })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Slides / Carousel</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isEditing ? 'Edit Slide' : 'Add New Slide'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter slide title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter slide description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-4 w-full h-40 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Slide' : 'Add Slide'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sliders List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sliders ({sliders.length})</h2>

            {isLoading ? (
              <LoadingSpinner />
            ) : sliders.length === 0 ? (
              <EmptyState message="No sliders created yet" />
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sliders.map((slider) => (
                  <div key={slider._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    {slider.image && (
                      <img
                        src={slider.image}
                        alt={slider.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-bold text-gray-900">{slider.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{slider.description}</p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(slider)}
                        className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slider._id)}
                        className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AdminLayout>
  )
}
