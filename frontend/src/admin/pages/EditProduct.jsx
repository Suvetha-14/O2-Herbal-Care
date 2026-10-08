import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, updateProduct } from '../services/adminApi'
import ProductForm from '../components/ProductForm'
import AdminLayout from '../components/AdminLayout'
import useToast from '../hooks/useToast'
import { Toast, LoadingSpinner } from '../components/Common'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function EditProduct() {
  const { admin, loading } = useAdminAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin')
      return
    }
    if (!loading && admin) {
      fetchProduct()
    }
  }, [id, loading, admin, navigate])

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id)
      setProduct(response.data.product)
    } catch (error) {
      addToast('Failed to fetch product', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
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

      await updateProduct(id, payload)
      addToast('Product updated successfully', 'success')
      
      setTimeout(() => {
        navigate('/admin/products')
      }, 1000)
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update product', 'error')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500 text-lg">Product not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-2">{product.name}</p>
        </div>

        <ProductForm initialData={product} onSubmit={handleSubmit} loading={submitting} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AdminLayout>
  )
}
