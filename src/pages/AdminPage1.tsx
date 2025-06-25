import React, { useEffect,useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, FileSpreadsheet, Filter, TrendingUp, Calendar } from 'lucide-react'
import { Student, StudentFilters } from '../types/Student'
import { exportToExcel } from '../utils/excelExport'
import SearchAndFilters from '../components/SearchAndFilters'
import StudentRow from '../components/StudentRow'

const AdminPage = () => {
    const [filters, setFilters] = useState<StudentFilters>({
        searchTerm: '',
        section: '',
        studyType: '',
        sortBy: 'name',
        sortOrder: 'time_desc'
    })
    const [students, setStudents] = useState<Student[]>([]);


    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const url = 'https://student-id-info-back-production.up.railway.app/student/?sort=time_desc&pageSize=100'
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('❌ Failed to fetch students:', error);
            }
        };
        fetchStudents();
    }, []);
    // Filter and sort students
    const filteredStudents = useMemo(() => {
        let filtered = students.filter((student) => {
            const hasSubmitted = Boolean(student.time);
            const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
            const matchesSection = !filters.section || student.section === filters.section
            const matchesStudyType = !filters.studyType || student.studyType === filters.studyType

            return hasSubmitted && matchesSearch && matchesSection && matchesStudyType
        })

        // Sort students
        filtered.sort((a, b) => {
            let aValue: string | number
            let bValue: string | number

            switch (filters.sortBy) {
                case 'name': aValue = a.name; bValue = b.name; break;
                case 'section': aValue = a.section; bValue = b.section; break;
                case 'studyType': aValue = a.studyType; bValue = b.studyType; break;
                case 'time':
                    aValue = new Date(a.time || 0).getTime();
                    bValue = new Date(b.time || 0).getTime();
                    break;
                default: aValue = a.name; bValue = b.name;
            }

            return filters.sortOrder === 'time_desc' ? aValue > bValue ? 1 : -1 : aValue < bValue ? 1 : -1;
        })

        return filtered
    }, [filters])

    // Statistics
    const stats = useMemo(() => {
        const submittedStudents = students.filter(s => Boolean(s.time)); // ✅ Only submitted
        const total = submittedStudents.length;

        const sections = [...new Set(submittedStudents.map(s => s.section))].length;

        // Calculate today's submissions
        const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        const todaySubmissions = submittedStudents.filter(s => {
            const submissionDate = new Date(s.time).toISOString().split('T')[0];
            return submissionDate === today;
        }).length;

        return { total, sections, todaySubmissions };
    }, [students]);

    const handleExport = () => {
        const dataToExport = filteredStudents.length > 0 ? filteredStudents : students
        const filename = filteredStudents.length < students.length
            ? 'filtered_students_data'
            : 'all_students_data'

        exportToExcel(dataToExport, filename)
    }

    return (
        <div className="min-h-screen p-2 sm:p-4 relative overflow-hidden">
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
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                        <div className="text-right">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">لوحة إدارة الطلاب</h1>
                            <p className="text-sm sm:text-base text-gray-600">إدارة ومراقبة طلبات الهوية الجامعية</p>
                        </div>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card rounded-xl p-4 sm:p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-blue-600 font-medium">إجمالي الطلاب</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-300">
                                    <Users className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card rounded-xl p-4 sm:p-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-purple-600 font-medium">عدد الأقسام</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-purple-800">{stats.sections}</p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center border-2 border-purple-300">
                                    <FileSpreadsheet className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-xl p-4 sm:p-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 sm:col-span-2 lg:col-span-1"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-green-600 font-medium">طلبات اليوم</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-800">{stats.todaySubmissions}</p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center border-2 border-green-300">
                                    <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
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
                    totalStudents={students.length}
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
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700 border-r border-gray-200">#</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700 border-r border-gray-200">الطالب</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700 border-r border-gray-200 hidden sm:table-cell">القسم</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700 border-r border-gray-200 hidden md:table-cell">نوع الدراسة</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700 border-r border-gray-200 hidden lg:table-cell">تاريخ التقديم</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">عرض الصورة</th>
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
                                        <td colSpan={6} className="px-6 py-12 text-center">
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