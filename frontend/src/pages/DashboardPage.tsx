import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API_URL = 'http://localhost:8000/api'

interface Stats {
  total_members: number
  genders: { male: number, female: number }
  status: { alive: number, deceased: number }
  generations: { generation: number, count: number }[]
}

const COLORS = ['#8b5a2b', '#d2b48c'] // wood, wood-light
const COLORS_STATUS = ['#4CAF50', '#9E9E9E'] // green, grey

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get<Stats>(`${API_URL}/statistics`).then(res => {
      setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading || !stats) {
    return <div className="p-20 text-center animate-pulse text-2xl">Đang tải số liệu...</div>
  }

  const genderData = [
    { name: 'Nam', value: stats.genders.male },
    { name: 'Nữ', value: stats.genders.female }
  ]

  const statusData = [
    { name: 'Còn sống', value: stats.status.alive },
    { name: 'Đã mất', value: stats.status.deceased }
  ]

  const genData = stats.generations.map(g => ({
    name: `Đời ${g.generation}`,
    'Thành viên': g.count
  }))

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <h2 className="text-3xl font-bold text-[#8b0000] mb-6 uppercase border-b-4 border-wood inline-block pb-2">
        Báo cáo Thống kê Dòng Họ
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-wood flex flex-col items-center justify-center">
          <p className="text-gray-500 text-lg font-bold uppercase mb-2">Tổng Thành Viên</p>
          <p className="text-5xl font-black text-wood-dark">{stats.total_members}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-wood flex flex-col items-center justify-center">
          <p className="text-gray-500 text-lg font-bold uppercase mb-2">Tỉ lệ Nam / Nữ</p>
          <p className="text-5xl font-black text-blue-700">{stats.genders.male} <span className="text-gray-300">/</span> <span className="text-pink-600">{stats.genders.female}</span></p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-wood flex flex-col items-center justify-center">
          <p className="text-gray-500 text-lg font-bold uppercase mb-2">Đã khuất</p>
          <p className="text-5xl font-black text-gray-700">{stats.status.deceased}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-96">
        {/* Gender Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-wood">
          <h3 className="text-xl font-bold text-center mb-4 text-wood-dark">Tỉ lệ Giới tính</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-wood">
          <h3 className="text-xl font-bold text-center mb-4 text-wood-dark">Tình trạng Sinh / Tử</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generation Bar Chart */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow-md border-2 border-wood h-96">
        <h3 className="text-xl font-bold text-center mb-4 text-wood-dark">Phân bổ thành viên theo Đời (Thế hệ)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={genData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Thành viên" fill="#8b0000" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
