// script.js 파일 내용 (최종 완성본 - 로컬 테스트용 localhost API 주소)

// Flask 서버가 5000 포트에서 실행 중임을 가정하고, 로컬 테스트를 위해 localhost를 사용합니다.
const API_URL = "http://localhost:5000/api/data";
const REFRESH_INTERVAL = 5000; // 5초마다 데이터 업데이트

function updateStatus(status, message) {
    const statusDisplay = document.getElementById('status-display');
    const serverStatus = document.getElementById('server-status');

    serverStatus.textContent = message;
    statusDisplay.className = 'status-box'; // 기존 클래스 초기화

    if (status === 'success') {
        statusDisplay.classList.add('status-connected');
    } else if (status === 'pending') {
        statusDisplay.classList.add('status-pending');
    } else { // error
        statusDisplay.classList.add('status-error');
    }
}

function formatPrice(price) {
    // 0이거나 유효하지 않은 값은 하이픈으로 표시, 유효한 값은 쉼표 형식으로 포맷
    if (price === '0' || !price) {
        return '-';
    }
    // 문자열을 숫자로 변환하여 쉼표 형식으로 포맷
    return Number(price).toLocaleString('ko-KR');
}

function fetchData() {
    updateStatus('pending', '데이터 요청 중...');

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                // HTTP 상태 코드가 200이 아니면 오류로 처리
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success' && data.data && data.data.length > 0) {
                renderTable(data.data);
                updateStatus('success', '연결 성공');
                document.getElementById('last-update').textContent = new Date().toLocaleTimeString('ko-KR');
            } else {
                updateStatus('error', '데이터 없음');
                document.getElementById('data-table-body').innerHTML = `<tr><td colspan="4" style="text-align:center;">서버에서 유효한 데이터가 반환되지 않았습니다.</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            updateStatus('error', '연결 실패 (서버 꺼짐 또는 방화벽 문제)');
            document.getElementById('data-table-body').innerHTML = `<tr><td colspan="4" style="text-align:center;">서버에 연결할 수 없습니다. Flask 서버 실행 상태를 확인하십시오.</td></tr>`;
        });
}

function renderTable(data) {
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = ''; // 테이블 내용 초기화

    data.forEach(item => {
        const row = tableBody.insertRow();

        row.insertCell().textContent = item.stock_code;
        row.insertCell().textContent = formatPrice(item.current_price);
        row.insertCell().textContent = formatPrice(item.purchase_price);
        row.insertCell().textContent = formatPrice(item.stop_loss_price);
    });
}

// 초기 로드 시 데이터 호출
fetchData();

// 주기적인 데이터 업데이트 설정
setInterval(fetchData, REFRESH_INTERVAL);