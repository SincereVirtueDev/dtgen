import React, { useEffect } from 'react'
import { GenealogyTree } from '../components/FamilyTree/GenealogyTree'
import { useGenealogyStore } from '../store/useGenealogyStore'

export const FamilyTreePage: React.FC = () => {
  const { fetchData, loading, error } = useGenealogyStore()

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <div className="p-8 flex justify-center text-gray-500">Đang tải phả hệ...</div>
  if (error) return <div className="p-8 flex justify-center text-red-500">Lỗi: {error}</div>

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-50">
      <GenealogyTree />
    </div>
  )
}
