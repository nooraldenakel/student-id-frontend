import { useState, useMemo } from 'react' //React, 
import { motion } from 'framer-motion'
import { Users, FileSpreadsheet } from 'lucide-react' //, Filter, TrendingUp
import { StudentFilters } from '../types/Student' //Student, 
import { mockStudents } from '../data/mockStudents'
import { exportToExcel } from '../utils/excelExport'
import SearchAndFilters from '../components/SearchAndFilters'
import StudentRow from '../components/StudentRow'

const AdminPage = () => {
  const [filters, setFilters] = useState<StudentFilters>({
    searchTerm: '',
    section: '',
    studyType: '',
    sortBy: 'submissionDate',
    sortOrder: 'desc'
  })

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = mockStudents.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesSection = !filters.section || student.section === filters.section
      const matchesStudyType = !filters.studyType || student.studyType === filters.studyType
      
      return matchesSearch && matchesSection && matchesStudyType
    })

    // Sort students
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'section':
          aValue = a.section
          bValue = b.section
          break
        case 'studyType':
          aValue = a.studyType
          bValue = b.studyType
          break
        case 'submissionDate':
          aValue = new Date(a.submissionDate).getTime()
          bValue = new Date(b.submissionDate).getTime()
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [filters])

  // Statistics
  const stats = useMemo(() => {
    const total = mockStudents.length
    const sections = [...new Set(mockStudents.map(s => s.section))].length

    return { total, sections }
  }, [])

  const handleExport = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : mockStudents
    const filename = filteredStudents.length < mockStudents.length 
      ? 'filtered_students_data' 
      : 'all_students_data'
    
    exportToExcel(dataToExport, filename)
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">لوحة إدارة الطلاب</h1>
              <p className="text-gray-600">إدارة ومراقبة طلبات الهوية الجامعية</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-medium">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-300">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50"
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-purple-600 font-medium">عدد الأقسام</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.sections}</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center border-2 border-purple-300">
                  <FileSpreadsheet className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <SearchAndFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          totalStudents={mockStudents.length}
          filteredStudents={filteredStudents.length}
        />

        {/* Students Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl overflow-hidden border-2 border-gray-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200">#</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-r border-gray-200">الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-r border-gray-200">القسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-r border-gray-200">نوع الدراسة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-r border-gray-200">تاريخ التقديم</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200">حالة الصورة</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">عرض الصورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <StudentRow 
                      key={student.id} 
                      student={student} 
                      index={index}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">لا توجد نتائج</p>
                        <p className="text-sm">لم يتم العثور على طلاب يطابقون معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminPage