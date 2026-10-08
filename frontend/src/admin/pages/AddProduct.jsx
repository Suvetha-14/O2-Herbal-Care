import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../services/adminApi'
import ProductForm from '../components/ProductForm'
import AdminLayout from '../components/AdminLayout'
import useToast from '../hooks/useToast'
import { Toast } from '../components/Common'

export default function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      // Prepare form data for API
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        discountPrice: parseFloat(formData.discountPrice) || 0,
        stock: parseInt(formData.stock),
        order: parseInt(formData.order) || 0,
        description: formData.description,
        ingredients: formData.ingredients,
        skinType: formData.skinType,
        hairType: formData.hairType,
        images: formData.images,
        isActive: formData.isActive,
      }

      await createProduct(payload)
      addToast('Product created successfully', 'success')
      
      setTimeout(() => {
        navigate('/admin/products')
      }, 1000)
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create product', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-2">Create a new product in the catalog</p>
        </div>

        <ProductForm onSubmit={handleSubmit} loading={loading} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AdminLayout>
  )
}
