import React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SortAsc, SortDesc, Download } from 'lucide-react'
import { StudentFilters } from '../types/Student'

interface SearchAndFiltersProps {
  filters: StudentFilters
  onFiltersChange: (filters: StudentFilters) => void
  onExport: () => void
  totalStudents: number
  filteredStudents: number
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  totalStudents,
  filteredStudents
}) => {
  const sections = [
    'جميع الأقسام',
    'علوم الحاسوب',
    'الهندسة المدنية',
    'إدارة الأعمال',
    'الطب',
    'الهندسة الكهربائية',
    'القانون',
    'الصيدلة'
  ]

  const studyTypes = ['جميع الأنواع', 'صباحي', 'مسائي']

  const sortOptions = [
    { value: 'name', label: 'الاسم' },
    { value: 'section', label: 'القسم' },
    { value: 'studyType', label: 'نوع الدراسة' },
    { value: 'submissionDate', label: 'تاريخ التقديم' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 mb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
            البحث بالاسم
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              placeholder="ابحث عن طالب بالاسم..."
              className="input-field pr-12"
            />
          </div>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
            القسم
          </label>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filters.section}
              onChange={(e) => onFiltersChange({ ...filters, section: e.target.value })}
              className="input-field pr-12 appearance-none"
            >
              {sections.map((section) => (
                <option key={section} value={section === 'جميع الأقسام' ? '' : section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Study Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
            نوع الدراسة
          </label>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filters.studyType}
              onChange={(e) => onFiltersChange({ ...filters, studyType: e.target.value })}
              className="input-field pr-12 appearance-none"
            >
              {studyTypes.map((type) => (
                <option key={type} value={type === 'جميع الأنواع' ? '' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Sort Options */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <label className="text-sm font-semibold text-gray-700">ترتيب حسب:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                sortBy: e.target.value as StudentFilters['sortBy']
              })}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onFiltersChange({ 
              ...filters, 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
            })}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={filters.sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4 text-gray-600" />
            ) : (
              <SortDesc className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Export and Stats */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-sm text-gray-600">
            عرض {filteredStudents} من أصل {totalStudents} طالب
          </div>
          
          <button
            onClick={onExport}
            className="btn-primary flex items-center space-x-2 space-x-reverse px-4 py-2"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SearchAndFilters