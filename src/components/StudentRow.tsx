import React from 'react'
import { motion } from 'framer-motion'
import { Hash, GraduationCap, Clock, Calendar, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { Student } from '../types/Student'

interface StudentRowProps {
  student: Student
  index: number
}

const StudentRow: React.FC<StudentRowProps> = ({ student, index }) => {
  //const isImageValid = Object.values(student.imageAnalysis).every(val => val)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b-2 border-gray-100"
    >
      <td className="px-6 py-4 text-center border-r-2 border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">
          {index + 1}
        </div>
      </td>
      
      <td className="px-6 py-4 border-r-2 border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <img 
            src={student.imageUrl} 
            alt={student.name}
            className="w-12 h-12 rounded-full object-cover border-3 border-blue-300 shadow-md"
          />
          <div className="text-right">
            <p className="font-bold text-gray-800">{student.name}</p>
            <p className="text-sm text-blue-600 flex items-center space-x-1 space-x-reverse font-medium">
                          <Hash className="w-3 h-3" />
                          <span>{student.symbol}</span>
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-right border-r-2 border-gray-100">
        <div className="flex items-center space-x-2 space-x-reverse p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200">
          <GraduationCap className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-purple-800">{student.section}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-right border-r-2 border-gray-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Clock className="w-4 h-4 text-green-600" />
          <span className={`px-3 py-2 rounded-full text-sm font-bold border-2 ${
            student.studyType === 'صباحي' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300' 
              : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-300'
          }`}>
            {student.studyType}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-right border-r-2 border-gray-100">
        <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-bold text-gray-800">{student.time}</span>
                  </div>
                  <div className="text-gray-600 font-medium text-sm">{student.time}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => window.open(student.imageUrl, '_blank')}
          className="inline-flex items-center space-x-1 space-x-reverse px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-xl text-sm font-bold transition-all duration-200 border-2 border-blue-300 shadow-sm hover:shadow-md"
        >
          <Eye className="w-4 h-4" />
          <span>عرض</span>
        </button>
      </td>
    </motion.tr>
  )
}

export default StudentRow