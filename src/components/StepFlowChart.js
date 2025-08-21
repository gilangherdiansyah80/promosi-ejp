// components/StepFlowChart.js
"use client";

import { CheckCircle, ArrowRight } from "lucide-react";

export default function StepFlow({ steps, activeIndex }) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              idx <= activeIndex ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            {idx < activeIndex ? (
              <CheckCircle size={16} />
            ) : (
              <span className="font-bold">{idx + 1}</span>
            )}
          </div>
          <span
            className={`${
              idx <= activeIndex ? "text-blue-600" : "text-gray-500"
            } font-medium`}
          >
            {step}
          </span>
          {idx < steps.length - 1 && (
            <ArrowRight
              className={`${
                idx < activeIndex ? "text-blue-600" : "text-gray-400"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
