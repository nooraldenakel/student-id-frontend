import React, { useEffect,useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, FileSpreadsheet, Filter, TrendingUp, Calendar, ChevronLeft, ChevronRight, Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import { Student, StudentFilters } from '../types/Student'
import { exportToExcel } from '../utils/excelExport'
import SearchAndFilters from '../components/SearchAndFilters'
import StudentRow from '../components/StudentRow'

const AdminPage = () => {
    // Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    })
    const [loginErrors, setLoginErrors] = useState({
        username: false,
        password: false,
        invalid: false
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loggingIn, setLoggingIn] = useState(false)

    // Admin credentials (in real app, this would be handled by backend)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'se_n00rALDENakel'
    }

    const [filters, setFilters] = useState<StudentFilters>({
        searchTerm: '',
        section: '',
        studyType: '',
        sortBy: 'name',
        sortOrder: 'time_desc'
    })

    const [students, setStudents] = useState<Student[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [studentsPerPage, setStudentsPerPage] = useState(10)
    const [customPerPage, setCustomPerPage] = useState('')

    // Preset options for students per page
    const perPageOptions = [10, 30, 50, 100, 150, 200]

    // Authentication functions
    const handleLoginInputChange = (field: string, value: string) => {
        setLoginData(prev => ({ ...prev, [field]: value }))
        setLoginErrors(prev => ({ ...prev, [field]: false, invalid: false }))
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        const usernameValid = loginData.username.trim() !== ''
        const passwordValid = loginData.password.trim() !== ''

        setLoginErrors({
            username: !usernameValid,
            password: !passwordValid,
            invalid: false
        })

        if (!usernameValid || !passwordValid) {
            return
        }

        setLoggingIn(true)

        // Simulate API call
        setTimeout(() => {
            if (loginData.username === ADMIN_CREDENTIALS.username &&
                loginData.password === ADMIN_CREDENTIALS.password) {
                setIsAuthenticated(true)
                setLoginErrors({ username: false, password: false, invalid: false })
            } else {
                setLoginErrors({ username: false, password: false, invalid: true })
            }
            setLoggingIn(false)
        }, 1500)
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        setLoginData({ username: '', password: '' })
        setLoginErrors({ username: false, password: false, invalid: false })
    }

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const url = `https://student-id-info-back-production.up.railway.app/student/?sort=time_desc&pageSize=${studentsPerPage}&page=${currentPage}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('❌ Failed to fetch students:', error);
            }
        };

        fetchStudents();
    }, [currentPage, studentsPerPage]);

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

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
    const startIndex = (currentPage - 1) * studentsPerPage
    const endIndex = startIndex + studentsPerPage
    const currentStudents = filteredStudents.slice(startIndex, endIndex)

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [filters, studentsPerPage])

    // Statistics
    const stats = useMemo(() => {
        const submittedStudents = students.filter(s => Boolean(s.time)); // ✅ Only submitteddd
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

    const handlePerPageChange = (value: string) => {
        if (value === 'custom') {
            return
        }
        const numValue = parseInt(value)
        if (numValue > 0) {
            setStudentsPerPage(numValue)
            setCustomPerPage('')
            setCurrentPage(1)
        }
    }

    const handleCustomPerPageSubmit = () => {
        const numValue = parseInt(customPerPage)
        if (numValue > 0 && numValue <= 1000) {
            setStudentsPerPage(numValue)
            setCurrentPage(1)
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const start = Math.max(1, currentPage - 2)
            const end = Math.min(totalPages, start + maxVisiblePages - 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-40 left-40 w-60 h-60 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md mx-auto relative z-10"
                >
                    <div className="glass-card rounded-3xl p-8 shadow-2xl border-2 border-red-200">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl mb-6 shadow-2xl"
                            >
                                <Shield className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-gray-800 mb-2">دخول المدير</h2>
                            <p className="text-gray-600">أدخل بيانات الدخول للوصول إلى لوحة الإدارة</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    اسم المستخدم
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={loginData.username}
                                        onChange={(e) => handleLoginInputChange('username', e.target.value)}
                                        placeholder="أدخل اسم المستخدم"
                                        className={`input-field pr-12 ${loginErrors.username ? 'border-red-500 bg-red-50' : ''}`}
                                    />
                                </div>
                                {loginErrors.username && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm mt-2 text-right"
                                    >
                                        اسم المستخدم مطلوب
                                    </motion.p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={loginData.password}
                                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                                        placeholder="أدخل كلمة المرور"
                                        className={`input-field pr-12 pl-12 ${loginErrors.password ? 'border-red-500 bg-red-50' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {loginErrors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm mt-2 text-right"
                                    >
                                        كلمة المرور مطلوبة
                                    </motion.p>
                                )}
                            </div>

                            {loginErrors.invalid && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                                >
                                    <p className="text-red-600 text-sm text-center font-medium">
                                        اسم المستخدم أو كلمة المرور غير صحيحة
                                    </p>
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={loggingIn}
                                className="btn-primary w-full flex items-center justify-center space-x-2 space-x-reverse"
                                whileHover={{ scale: !loggingIn ? 1.02 : 1 }}
                                whileTap={{ scale: !loggingIn ? 0.98 : 1 }}
                            >
                                {loggingIn ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>دخول</span>
                                        <Lock className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        )
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
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <button
                                onClick={handleLogout}
                                className="btn-secondary flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm"
                            >
                                <span>تسجيل الخروج</span>
                                <Lock className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
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

                {/* Pagination Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-gray-200"
                >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Per Page Selection */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <label className="text-sm font-semibold text-gray-700">عرض:</label>
                                <select
                                    value={perPageOptions.includes(studentsPerPage) ? studentsPerPage : 'custom'}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option} طالب
                                        </option>
                                    ))}
                                    <option value="custom">عدد مخصص</option>
                                </select>
                            </div>

                            {/* Custom Per Page Input */}
                            {!perPageOptions.includes(studentsPerPage) && (
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <input
                                        type="number"
                                        value={customPerPage}
                                        onChange={(e) => setCustomPerPage(e.target.value)}
                                        placeholder="أدخل العدد"
                                        min="1"
                                        max="1000"
                                        className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                    />
                                    <button
                                        onClick={handleCustomPerPageSubmit}
                                        disabled={!customPerPage || parseInt(customPerPage) <= 0}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        تطبيق
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Pagination Info */}
                        <div className="text-sm text-gray-600">
                            عرض {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} من أصل {filteredStudents.length} طالب
                        </div>
                    </div>
                </motion.div>

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
                                {currentStudents.length > 0 ? (
                                    currentStudents.map((student, index) => (
                                        <StudentRow
                                            key={student.id}
                                            student={student}
                                            index={startIndex + index}
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

                {/* Pagination Navigation */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6 border-2 border-gray-200"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Page Info */}
                            <div className="text-sm text-gray-600 order-2 sm:order-1">
                                الصفحة {currentPage} من {totalPages}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center space-x-2 space-x-reverse order-1 sm:order-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1 space-x-reverse">
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default AdminPage