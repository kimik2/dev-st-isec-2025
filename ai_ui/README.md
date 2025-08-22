# 인비저블 워터마크 검출 프로그램
- react로 UI프로그램을 만들꺼야
- Figma로 디지인된 파일이 있어(https://www.figma.com/design/Oxs2lmy8Mujliqg1BN7f9A/ISEC-2025?node-id=0-1&p=f&t=LXuYneXCoQlSJV4n-0)
- 로그인 창은 없고 두개의 페이지에서 모든 작업이 이루어져
- 첫번째 페이지는 Upload Image
- 좌측 패널은 Request Details, 우측은  Detection Details 
 
## Upload Images
 - 사용자가 파일을 선택해서 올릴 수 있도록 Drag And Drop 과 파일 추가 버튼이 있음
 - 파일은 PNG,JPG파일을 선택해서 할 수 있고
 - 파일명이 입력되면 In Queue 화면이동

## In Queue
 - 입력된 이미지 파일을 Request Details 패널에 Attached라는 캡션과 함께 이미지를 보여줌
 - 우측은 Detection Details 패널에 In Queue라는 캡션과 함께 대기중인 아이콘으로 표시

## In Progress
 - 우측은 Detection Details 패널에 In Progress라는 캡션과 함께 대기중인 아이콘으로 표시
 - 선택된 파일명을 로컬 REST 서버로 http://127.0.0.1:8080/detection으로 파일명을 전송(POST)
 - 결과(detected, not detected)를 대기

## detected 
 - 처리가 완료되면 결과를 수신하여 검출일 경우 우측은 Detection Details 화면에 출력
 - 이때 출력되는 정보는 Company,Team,Email, Contect, Device, Serial, IP, Time임

## Not Detected
 - 처리가 완료되면 결과를 수신하여 미검출일 경우 우측은 Detection Details 화면에 출력
 - 검출되지 않음이라는 아이콘 표시

 