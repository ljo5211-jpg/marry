document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animation (Fade-in)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));


    // 2. Accordion for Accounts
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.classList.toggle('active');
        });
    });
});

// 3. Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast();
    } catch (err) {
        console.error('Fallback copy failed', err);
        alert('복사하기가 지원되지 않는 브라우저입니다.');
    }
    document.body.removeChild(textArea);
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 4. RSVP Form Handler (Firebase)
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.handleRSVP = async function (event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = '전송 중...';
    submitBtn.disabled = true;

    try {
        const name = event.target.querySelector('input[type="text"]').value;
        const side = event.target.querySelectorAll('select')[0].value;
        const count = event.target.querySelectorAll('select')[1].value;

        await addDoc(collection(db, "rsvps"), {
            name: name,
            side: side,
            count: parseInt(count),
            timestamp: serverTimestamp()
        });

        alert('참석 의사가 성공적으로 전달되었습니다!');
        event.target.reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n(Firebase 설정이 올바른지 확인 필요)');
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}
