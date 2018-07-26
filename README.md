# ITS-MOBILE
ITS-Mobile

#=============================
# Spring 2015 notes:
#=============================
What we added to this folder in this semester is the ITS_spring_2015 folder, which contains the Main.php (the IRM tree page) and files that helps Main.php work. 
These are written by the frontend team. Mobile team developers can ask them for the latest version of these files and replace the old ones.

We added a few lines of code in C:\Users\hp\Desktop\Mobile\client\js\ITS_jquery_mobile.js to make the new IRM tree tab working, but these code only work fine with a html page, not with a PHP page. 
Mobile team need to find a new method to embed the PHP page successfully.
#=============================

설명
ITS (Intelligent Tutoring System) 은 조지아 공대의 교수 두 분이서 시작한 프로젝트로 두 분의 수업을 듣는 학생들을 돕기 위해서 만들었다. 웹 기반으로 어느 정도 만들어서 이용되고 있으며 Mobile 버젼은 2015년 봄에 개발 되었다. 

반년 후 저를 비롯한 3명 의 팀이 개발을 이어나갔다. 저는 팀의 리더로서 매니저와 매 주 진행 상황을 보고하고 팀원들과는 피드백과 다음 주 미팅 전 까지의 할 일을 분배 해주는 역할도 했다.

2015년 봄 Intelligent Tutoring System 이라는 웹사이트를 모바일로 개발을 해 학생들이 더 쉽게 웹사이트를 핸드폰을 통해 사용할 수 있게 하려는 목적으로 만들었다.
Native 언어를 사용하는 대신 Phonegap Cordova를 프레임워크를 지정되어 있고, PHP 백엔드 와 JQuery Ajax Json 프런트엔드를 썼다.

내가 한 일

새로 접하는 프레임워크를 이해하기 위해서 조사하는데 초반에 시간을 많이 썼다.
그 후, 프런트와 백엔드를 이해하고 사용함과 동시에 모바일 어플리케이션에 도움이 될 개발 목표를 찾았다.
새로운 기능, Performance Review Tab을 만들어 학생들이 얼마나 잘하고 있는지에 대해서 피드백을 주는 기능을 구현하기로 했다. 우선은 백엔드에서 데이터를 가지고 와서 간단한 알고리즘을 (이 알고리즘은 후에 머신러닝, 딥러닝으로 개발하면 좀 더 구체적인 피드백을 줄 수 있다) 이용해서 프런트에 새 탭을 만들어 학생들에게 제공됬다.

배운 점
프로젝트 팀의 리더 역할을 맡은 것은 처음이었다. 
팀원들에게 지시 사항을 잘 전달해주지 못했고 그들에게 일을 시키는 대신 내가 다 맡아서 했다. 
팀원 리소스를 잘 사용하지 못 해서 프로젝트 시작 당시 내가 계획했던 개발 목록을 다 실행 하지 못했다.
코딩 면에서는 내가 처음 만들었던 안드로이드 어플리케이션보다 더 나은 구조와 더 체계적인 프레임을 배웠다.
Ajax, JQuery에 대해서 배웠다.

