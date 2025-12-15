// script.js
파일
내용

const
API_URL = 'http://127.0.0.1:5000/api/data';
const
TABLE_BODY = document.getElementById('data-table-body');
const
SERVER_STATUS = document.getElementById('server-status');
const
UPDATE_TIME = document.getElementById('update-time');

/ **
*Flask
서버에서
주식
데이터를
비동기적으로
가져옵니다.
* /
async function
fetchStockData()
{
try {
const response = await fetch(API_URL);

if (!response.ok) {
throw new Error(`HTTP 오류: $
    {response.status}
`);
}

const
json = await response.json();

// 서버
상태
업데이트
SERVER_STATUS.textContent = '연결 성공';
SERVER_STATUS.className = 'status-badge status-ok';

// 데이터
표시
displayData(json.data);

// 타임스탬프
업데이트
const
latestTime = json.data.length > 0 ? json.data[0].update_time: '데이터 없음';
UPDATE_TIME.textContent = latestTime;

} catch(error)
{
    console.error('데이터를 불러오는 데 실패했습니다:', error);
SERVER_STATUS.textContent = '연결 실패';
SERVER_STATUS.className = 'status-badge status-error';
TABLE_BODY.innerHTML = ` < tr > < td
colspan = "4" > 서버에
접속할
수
없습니다.Python
서버를
실행했는지
확인하세요. < / td > < / tr > `;
}
}

/ **
*받은
데이터를
HTML
테이블에
표시합니다.
* @ param
{Array < Object >}
data - 주식
데이터
배열
* /
function
displayData(data)
{
TABLE_BODY.innerHTML = ''; // 테이블
내용
초기화

if (data.length === 0) {
TABLE_BODY.innerHTML = ` < tr > < td colspan="4" > DB에 저장된 데이터가 없습니다.< / td > < / tr > `;
return;
}

data.forEach(item= > {
    const
row = TABLE_BODY.insertRow();
row.insertCell(0).textContent = item.stock_code;
row.insertCell(1).textContent = formatPrice(item.current_price);
row.insertCell(2).textContent = formatPrice(item.purchase_price);
row.insertCell(3).textContent = formatPrice(item.stop_loss_price);
});
}

/ **
*가격을
보기
좋게
쉼표
형식으로
포맷합니다.
* @ param
{string}
price - 가격
문자열
* @ returns
{string}
포맷된
가격
* /
function
formatPrice(price)
{
// 음수
부호('-')
나
공백을
제거하고
숫자만
남깁니다.
const
number = parseInt(price.replace( / [ ^ 0 - 9] / g, ''));
if (isNaN(number))
    return price;
return number.toLocaleString('ko-KR'); // 한국식
쉼표
형식
}

// 5
초마다
데이터를
업데이트합니다.
setInterval(fetchStockData, 5000);

// 최초
한
번
데이터
로드
fetchStockData();