import * as XLSX from 'xlsx'
import { Student } from '../types/Student'

export const exportToExcel = (students: Student[], filename: string = 'students_data') => {
  // Prepare data for Excel export
  const excelData = students.map((student, index) => ({
    'الرقم التسلسلي': index + 1,
    'اسم الطالب': student.name,
    'الرقم الامتحاني': student.examCode,
    'القسم': student.section,
    'نوع الدراسة': student.studyType,
    'سنة الميلاد': student.birthYear,
    'تاريخ الميلاد': student.birthDate,
    'تاريخ التقديم': student.submissionDate,
    'وقت التقديم': student.submissionTime,
    'رابط الصورة': student.imageUrl,
    'وضعية الرأس': student.imageAnalysis.headPosition ? 'صالح' : 'غير صالح',
    'العينان مفتوحتان': student.imageAnalysis.eyesOpen ? 'صالح' : 'غير صالح',
    'فحص النظارات': student.imageAnalysis.glasses ? 'صالح' : 'غير صالح',
    'الخلفية البيضاء': student.imageAnalysis.whiteBackground ? 'صالح' : 'غير صالح',
    'جودة الإضاءة': student.imageAnalysis.goodLighting ? 'صالح' : 'غير صالح',
    'حالة الصورة': Object.values(student.imageAnalysis).every(val => val) ? 'مقبولة' : 'مرفوضة'
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 8 },  // الرقم التسلسلي
    { wch: 20 }, // اسم الطالب
    { wch: 15 }, // الرقم الامتحاني
    { wch: 18 }, // القسم
    { wch: 12 }, // نوع الدراسة
    { wch: 12 }, // سنة الميلاد
    { wch: 15 }, // تاريخ الميلاد
    { wch: 15 }, // تاريخ التقديم
    { wch: 15 }, // وقت التقديم
    { wch: 30 }, // رابط الصورة
    { wch: 12 }, // وضعية الرأس
    { wch: 15 }, // العينان مفتوحتان
    { wch: 12 }, // فحص النظارات
    { wch: 15 }, // الخلفية البيضاء
    { wch: 12 }, // جودة الإضاءة
    { wch: 12 }  // حالة الصورة
  ]
  
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'بيانات الطلاب')

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0]
  const finalFilename = `${filename}_${currentDate}.xlsx`

  // Save file
  XLSX.writeFile(workbook, finalFilename)
}