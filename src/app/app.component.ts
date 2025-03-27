import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  form: FormGroup;
  currentQuestion = 0;
  questions = [
    [
      'public class ExceptionHandling {',
      '    public static int divide(int a, int b) {',
      '        try {',
      '            return a / b;',
      '        } catch (ArithmeticException e) {',
      "            System.err.println('Division by zero!');",
      '            return 0; // Default return value',
      '        }',
      '    }',
      '    public static void main(String[] args) {',
      '        int result = divide(10, 0);',
      "        System.out.println('Result: ' + result);",
      '    }',
      '}',
    ],
    [
      'public class ExceptionHandling {',
      '    public static void main(String[] args) {',
      '        int result = divide(10, 0);',
      "        System.out.println('Result: ' + result);",
      '    }',
      '}',
    ],
  ];
  selectedLines: number[] = [];

  title = '';

  exceptionTypes = [
    'ArithmeticException',
    'NullPointerException',
    'ArrayIndexOutOfBoundsException',
    'IOException',
    'IllegalArgumentException',
    'outro',
  ];
  answers: {
    selectedLines: number[];
    exceptionType: any;
    otherExceptionType: any;
    exceptionReason: any;
    handlingReason: any;
    expectedBehavior: any;
    exceptionTypeReason: any;
  }[] = [];

  @ViewChild('codeSnippet') codeSnippet!: ElementRef<HTMLElement>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      exceptionType: [''],
      otherExceptionType: [''],
      exceptionReason: [''],
      handlingReason: [''],
      expectedBehavior: [''],
      exceptionTypeReason: [''],
    });
    this.answers = Array(this.questions.length).fill({
      selectedLines: [],
      exceptionType: '',
      otherExceptionType: '',
      exceptionReason: '',
      handlingReason: '',
      expectedBehavior: '',
      exceptionTypeReason: '',
    });
  }

  // Method to load problems from a file
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const fileContent = reader.result as string;
          const jsonData: { title: string; problems: string[][] } =
            JSON.parse(fileContent);

          if(jsonData.title) {
            this.title = jsonData.title;
          }

          if (jsonData.problems && Array.isArray(jsonData.problems)) {
            this.questions = jsonData.problems; // Load problems array
            // Reset answers for the newly loaded problems
            this.answers = Array(this.questions.length).fill({
              selectedLines: [],
              exceptionType: '',
              otherExceptionType: '',
              exceptionReason: '',
              handlingReason: '',
              expectedBehavior: '',
              exceptionTypeReason: '',
            });
            this.setCurrentQuestion(0); // Start from the first problem
          } else {
            console.error('Invalid file format. "problems" array not found.');
          }
        } catch (error) {
          console.error('Error reading the file:', error);
        }
      };
      reader.readAsText(file);
    }
  }

  setCurrentQuestion(index: number) {
    this.saveSelectedAnswers();
    this.currentQuestion = index;
    this.selectedLines = this.answers[index].selectedLines || [];
    if (this.answers[index]) {
      this.form.patchValue(this.answers[index]);
    } else {
      this.form.reset();
    }

    setTimeout(() => {
      this.codeSnippet.nativeElement
        .querySelectorAll('.line-checkbox')
        .forEach((checkbox) => {
          const line = parseInt(
            (checkbox as HTMLInputElement).dataset['line'] || '0',
            10
          );
          console.log(line, this.answers[index].selectedLines.includes(line));
          (checkbox as HTMLInputElement).checked =
            this.answers[index].selectedLines.includes(line);
        });
    }, 5);
  }

  onCheckboxChange(index: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedLines.push(index + 1);
    } else {
      this.selectedLines = this.selectedLines.filter(
        (line) => line !== index + 1
      );
    }
  }

  formSubmit() {
    this.saveSelectedAnswers();

    if (this.currentQuestion < this.questions.length - 1) {
      this.setCurrentQuestion(this.currentQuestion + 1);
    } else {
      this.downloadAnswers();
    }
  }

  private saveSelectedAnswers() {
    this.answers[this.currentQuestion] = {
      ...this.form.value,
      selectedLines: this.selectedLines,
    };
  }

  downloadAnswers() {
    const answers = this.answers.map((answer, index) => ({
      ...answer,
      question: this.questions[index].join('\n'),
    }));
    const blob = new Blob([JSON.stringify(answers)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answers.json';
    a.click();
  }
}
