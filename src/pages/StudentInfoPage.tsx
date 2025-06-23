import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    User, Hash, GraduationCap, Clock, Calendar,  //Camera,
    Check, Upload, Eye, Glasses, //X, ArrowRight,
  Sun, Square, AlertCircle, CheckCircle2, Trash2
} from 'lucide-react'

interface ImageAnalysis {
  headPosition: boolean
  eyesOpen: boolean
  glasses: boolean
  whiteBackground: boolean
  goodLighting: boolean
}

interface StudentData {
  name: string
  examCode: string
  collegeDepartment: string
  studyType: string
  birthYear?: string
  birthDate?: string
  imageUrl?: string
  imageAnalysis?: ImageAnalysis
}

const StudentInfoPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { studentName, examCode } = location.state || {}

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [birthYear, setBirthYear] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [inputMethod, setInputMethod] = useState<'manual' | 'calendar'>('manual')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fetchingInfo, setFetchingInfo] = useState(false)
  const isDataComplete = studentData?.birthYear && studentData?.imageUrl
  const hasExistingImage = studentData?.imageUrl && !selectedImage
  const [showSuccessModal, setShowSuccessModal] = useState(false)


  useEffect(() => {
        if (!accessToken || !examCode) {
            navigate('/');
            return;
        }

        const fetchStudentInfo = async () => {
            setLoading(true);
            setFetchingInfo(true);

            try {
                const response = await fetch(`/student/search?query=${examCode}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    console.log("❌ Response not OK:", response.status);
                    throw new Error('Fetch failed');
                }

                const data = await response.json();
                console.log("Fetched student data:", data);
                // Handle optional fields safely
                const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear().toString() : undefined;
                const birthDate = data.birthDate || undefined;
                const imageUrl = data.imageUrl || undefined;
                // Set state directly (not from state that hasn't updated yet!)
                if (birthDate) setBirthDate(birthDate);
                if (imageUrl) setImagePreview(imageUrl);

                setStudentData({
                    name: studentName || data.name || 'غير معروف',
                    examCode,
                    collegeDepartment: data.section || 'غير محدد',
                    studyType: data.studyType || 'غير محدد',
                    birthYear,
                    birthDate,
                    imageUrl,
                    imageAnalysis: {
                        headPosition: true,
                        eyesOpen: true,
                        glasses: true,
                        whiteBackground: true,
                        goodLighting: true
                    }
                });

            } catch (error) {
                console.error('❌ Error loading student info:', error);
                setStudentData(null); // So UI shows "خطأ في تحميل بيانات الطالب"
            } finally {
                setLoading(false); // ✅ Always end loading
                setFetchingInfo(false);
            }
        }
        fetchStudentInfo()
    }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        analyzeImage()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(studentData?.imageUrl || null)
    setImageAnalysis(studentData?.imageAnalysis || null)
    setAnalyzingImage(false)
  }

  const analyzeImage = () => {
    setAnalyzingImage(true)
    setImageAnalysis(null)

    // Simulate image analysis
    setTimeout(() => {
      const analysis: ImageAnalysis = {
        headPosition: Math.random() > 0.1,
        eyesOpen: Math.random() > 0.1,
        glasses: Math.random() > 0.1,
        whiteBackground: Math.random() > 0.1,
        goodLighting: Math.random() > 0.1
      }
      setImageAnalysis(analysis)
      setAnalyzingImage(false)
    }, 2000)
  }

  const handleDateChange = (date: string) => {
    setBirthDate(date)
    if (date) {
      const year = new Date(date).getFullYear()
      setBirthYear(year.toString())
    }
  }

  const handleYearChange = (year: string) => {
    setBirthYear(year)
    // Clear calendar date when manually entering year
    setBirthDate('')
  }

  const isFormValid = () => {
    // Check if birth data exists (either from API or user input)
    const hasBirthData = studentData?.birthYear || studentData?.birthDate || birthYear || birthDate
    
    // Check if image exists (either from API or user upload)
    const hasImage = studentData?.imageUrl || selectedImage
    
    // Check if image analysis exists and is valid (either from API or new analysis)
    const hasValidImageAnalysis = imageAnalysis && Object.values(imageAnalysis).every(result => result === true)
    
    return hasBirthData && hasImage && hasValidImageAnalysis
  }

  const handleSubmit = async () => {
        if (!isFormValid() || !selectedImage) {
            alert("❌ Please select an image and ensure analysis passed.");
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("birthDate", birthYear);
        formData.append("image", selectedImage);

        try {
            const response = await fetch(`/student/${examCode}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            setShowSuccessModal(true);
        } catch (err) {
            console.error("❌ Submission failed:", err);
            alert("فشل إرسال المعلومات. تحقق من الاتصال أو حاول مرة أخرى.");
        } finally {
            setSubmitting(false);
        }
    };
    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);

        if (!studentData) return;

        const updatedData: StudentData = {
            ...studentData,
            birthYear: birthYear || studentData.birthYear,
            imageUrl: imagePreview || studentData.imageUrl,
            imageAnalysis: imageAnalysis || studentData.imageAnalysis
        };

        setStudentData(updatedData);
        setSelectedImage(null);

        // Optionally refresh page state
        navigate('/student-info', {
            state: {
                studentName: updatedData.name,
                examCode: updatedData.examCode
            },
            replace: true
        });
    };

  const renderAnalysisItem = (
    label: string,
    result: boolean,
    icon: React.ReactNode,
    description: string
  ) => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200"
    >
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
        result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {result ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {result ? 'صالح' : 'غير صالح'}
        </span>
      </div>
      <div className="flex items-center space-x-3 space-x-reverse">
        <div>
          <p className="font-medium text-gray-800 text-right">{label}</p>
          <p className="text-sm text-gray-600 text-right">{description}</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل بيانات الطالب...</p>
                </div>
            </div>
        );
    }
    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">خطأ في تحميل بيانات الطالب</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mb-8"
                >
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 text-right">
                            {isDataComplete ? 'معلومات الطالب المحفوظة' : 'معلومات الطالب'}
                        </h1>
                        <p className="text-gray-600 text-right">
                            {isDataComplete
                                ? 'تم حفظ جميع معلوماتك بنجاح'
                                : 'أكمل ملفك الشخصي لتقديم الحصول على الهوية الجامعية'
                            }
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Right Column */}
                    <div className="space-y-6 order-1 lg:order-2">
                        {/* Student Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card rounded-2xl p-6 border-2 border-gradient-to-r from-blue-200 to-purple-200"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">تفاصيل الطالب</h2>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div className="text-right">
                                        <p className="text-sm text-blue-600 font-medium">اسم الطالب</p>
                                        <p className="font-bold text-gray-800">{studentData.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <Hash className="w-5 h-5 text-emerald-600" />
                                    <div className="text-right">
                                        <p className="text-sm text-emerald-600 font-medium">الرقم الامتحاني</p>
                                        <p className="font-bold text-gray-800">{studentData.examCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                    <div className="text-right">
                                        <p className="text-sm text-purple-600 font-medium">القسم</p>
                                        <p className="font-bold text-gray-800">{studentData.collegeDepartment}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <div className="text-right">
                                        <p className="text-sm text-orange-600 font-medium">نوع الدراسة</p>
                                        <p className="font-bold text-gray-800">{studentData.studyType}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Birth Year */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card rounded-2xl p-6 border-2 border-gradient-to-r from-green-200 to-emerald-200"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">سنة الميلاد</h2>

                            {studentData.birthYear ? (
                                // Show existing birth year (preview mode)
                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <div className="text-right">
                                        <p className="text-sm text-green-600 font-medium">سنة الميلاد</p>
                                        <p className="font-bold text-green-800 text-2xl">{studentData.birthYear}</p>
                                    </div>
                                </div>
                            ) : (
                                // Show input for birth year (increment/decrement only)
                                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                    <div className="flex-1 text-right">
                                        <p className="text-sm text-blue-600 font-medium mb-2">سنة الميلاد يجب ان تكون بين (1970-2011)</p>
                                        <div className="flex items-center space-x-4 space-x-reverse">
                                            <button
                                                onClick={() => handleYearChange(Math.min(2011, parseInt(birthYear || '1999') + 1).toString())}
                                                disabled={parseInt(birthYear) >= 2011}
                                                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center font-bold transition-colors border-2 border-blue-300"
                                            >
                                                +
                                            </button>

                                            <div className="flex-1 text-center">
                                                <div className="bg-white/80 rounded-lg py-3 px-4 border-2 border-blue-300 shadow-sm">
                                                    <span className="text-2xl font-bold text-gray-800">
                                                        {birthYear || '----'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleYearChange(Math.max(1970, parseInt(birthYear || '2000') - 1).toString())}
                                                disabled={parseInt(birthYear) <= 1970}
                                                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center font-bold transition-colors border-2 border-blue-300"
                                            >
                                                -
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Left Column */}
                    <div className="space-y-6 order-2 lg:order-1">
                        {/* Photo Upload */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-2xl p-6 border-2 border-gradient-to-r from-purple-200 to-pink-200"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">الصورة الشخصية</h2>

                            <div className="space-y-4">
                                {hasExistingImage ? (
                                    // Show existing image (large preview mode)
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <img
                                                src={studentData.imageUrl}
                                                alt="الصورة المحفوظة"
                                                className="w-64 h-64 object-cover rounded-xl mx-auto border-4 border-green-300 shadow-lg"
                                            />
                                        </div>
                                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                                            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-green-700 font-bold">تم حفظ الصورة بنجاح</p>
                                            <p className="text-green-600 text-sm mt-1">الصورة مقبولة ومحفوظة في النظام</p>
                                        </div>
                                    </div>
                                ) : !selectedImage ? (
                                    // Show upload area
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                                            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                            <p className="text-blue-600 font-semibold mb-2">
                                                رفع الصورة
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                انقر لاختيار ملف الصورة
                                            </p>
                                        </div>
                                    </label>
                                ) : (
                                    // Show new uploaded image
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview!}
                                                alt="معاينة"
                                                className="w-32 h-32 object-cover rounded-xl mx-auto border-4 border-blue-300 shadow-lg"
                                            />
                                            <button
                                                onClick={handleImageRemove}
                                                className="absolute -top-2 -right-2 btn-danger p-2 rounded-full border-2 border-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
                                            <p className="text-blue-700 font-bold">الصورة الجديدة</p>
                                        </div>
                                    </div>
                                )}

                                {analyzingImage && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-center space-x-3 space-x-reverse py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                                    >
                                        <p className="text-blue-600 font-medium">جاري تحليل الصورة...</p>
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </motion.div>
                                )}

                                {/* Only show image analysis for new uploads, not existing images */}
                                <AnimatePresence>
                                    {imageAnalysis && !analyzingImage && !hasExistingImage && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3"
                                        >
                                            <h3 className="font-semibold text-gray-800 mb-4 text-right">نتائج التحليل</h3>

                                            {renderAnalysisItem(
                                                'وضعية الرأس',
                                                imageAnalysis.headPosition,
                                                <User className="w-5 h-5 text-gray-600" />,
                                                'يجب أن يكون الرأس في وسط الإطار'
                                            )}

                                            {renderAnalysisItem(
                                                'العينان مفتوحتان',
                                                imageAnalysis.eyesOpen,
                                                <Eye className="w-5 h-5 text-gray-600" />,
                                                'يجب أن تكون العينان مرئيتان بوضوح'
                                            )}

                                            {renderAnalysisItem(
                                                'فحص النظارات',
                                                imageAnalysis.glasses,
                                                <Glasses className="w-5 h-5 text-gray-600" />,
                                                'لا يُسمح بالنظارات العاكسة'
                                            )}

                                            {renderAnalysisItem(
                                                'الخلفية',
                                                imageAnalysis.whiteBackground,
                                                <Square className="w-5 h-5 text-gray-600" />,
                                                'مطلوب خلفية بيضاء عادية'
                                            )}

                                            {renderAnalysisItem(
                                                'الإضاءة',
                                                imageAnalysis.goodLighting,
                                                <Sun className="w-5 h-5 text-gray-600" />,
                                                'إضاءة جيدة بدون ظلال'
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Submit Button - Only show if data is not complete */}
                        {!isDataComplete && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isFormValid() || submitting}
                                    className="btn-primary w-full flex items-center justify-center space-x-2 space-x-reverse py-4 border-2 border-blue-400"
                                >
                                    {submitting ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>إرسال المعلومات</span>
                                            <Check className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {!isFormValid() && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-600 text-sm text-center mt-3 p-3 bg-red-50 rounded-lg border-2 border-red-200"
                                    >
                                        {!studentData.birthYear && !birthYear &&
                                            "يرجى إدخال سنة الميلاد"}
                                        {(!studentData.imageUrl && !selectedImage) &&
                                            "يرجى رفع الصورة الشخصية"}
                                        {imageAnalysis && !Object.values(imageAnalysis).every(result => result === true) &&
                                            "يرجى التأكد من أن جميع نتائج تحليل الصورة صالحة"}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border-2 border-green-200"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    تم الإرسال بنجاح!
                                </h3>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    تم حفظ معلوماتك بنجاح في النظام. سيتم مراجعة طلبك والتواصل معك قريباً.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-green-700 font-medium">الاسم</span>
                                        <span className="text-green-800 font-bold">{studentData.name}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-green-700 font-medium">الرقم الامتحاني</span>
                                        <span className="text-green-800 font-bold">{studentData.examCode}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-green-700 font-medium">سنة الميلاد</span>
                                        <span className="text-green-800 font-bold">{birthYear || studentData.birthYear}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSuccessModalClose}
                                    className="btn-primary w-full mt-6 py-3 flex items-center justify-center space-x-2 space-x-reverse"
                                >
                                    <span>موافق</span>
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StudentInfoPage