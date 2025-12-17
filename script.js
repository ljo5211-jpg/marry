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

    // Safety Net: Bind Modify Button
    const btnModify = document.getElementById('btn-modify');
    if (btnModify) {
        btnModify.addEventListener('click', () => {
            console.log('Modify button clicked via Listener');
            if (window.openSearchModal) window.openSearchModal();
        });
    }
});

// 3. Copy to Clipboard
window.copyToClipboard = function (text) {
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

function showToast(message = '복사되었습니다.') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 4. RSVP Form Handler (Firebase)
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.handleRSVP = async function (event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = '전송 중...';
    submitBtn.disabled = true;

    try {
        const inputs = event.target.querySelectorAll('input');
        const selects = event.target.querySelectorAll('select');

        const name = inputs[0].value;
        const phone = inputs[1].value; // Phone field
        const side = selects[0].value;
        const count = selects[1].value;

        // Save to Firestore
        await addDoc(collection(db, "rsvps"), {
            name: name,
            phone: phone,
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

// 5. RSVP Modify/Cancel Logic (Phone Number Based)
window.openSearchModal = () => document.getElementById('search-modal').classList.add('show');
window.closeSearchModal = () => {
    document.getElementById('search-modal').classList.remove('show');
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-phone').value = '';
};

window.searchRSVP = async () => {
    const phone = document.getElementById('search-phone').value;
    if (!phone) { alert('연락처를 입력해 주세요.'); return; }

    // Search by phone number
    const q = query(collection(db, "rsvps"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';

    if (querySnapshot.empty) {
        resultsDiv.innerHTML = '<p style="color:#888; text-align:center;">검색 결과가 없습니다.</p>';
        return;
    }

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `
            <div>
                <strong>${data.name}</strong> (${data.side === 'groom' ? '신랑측' : '신부측'})<br>
                <small>${data.count}명 (${data.phone})</small>
            </div>
            <button class="btn-copy-small" style="background:#f0f0f0;">선택</button>
        `;
        div.onclick = () => openEditModal(doc.id, data);
        resultsDiv.appendChild(div);
    });
};

window.openEditModal = (id, data) => {
    closeSearchModal();
    document.getElementById('edit-modal').classList.add('show');

    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-display-name').innerText = data.name;
    document.getElementById('edit-side').value = data.side;
    document.getElementById('edit-count').value = data.count.toString();
};

window.closeEditModal = () => document.getElementById('edit-modal').classList.remove('show');

// Custom Confirm Logic
window.showConfirm = (message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');

        msgEl.innerText = message;
        modal.classList.add('show');

        const cleanup = () => {
            modal.classList.remove('show');
            btnYes.replaceWith(btnYes.cloneNode(true)); // Remove listeners
            btnNo.replaceWith(btnNo.cloneNode(true));
        };

        document.getElementById('btn-confirm-yes').onclick = () => {
            cleanup();
            resolve(true);
        };

        document.getElementById('btn-confirm-no').onclick = () => {
            cleanup();
            resolve(false);
        };
    });
};

window.updateRSVP = async () => {
    const id = document.getElementById('edit-doc-id').value;
    const side = document.getElementById('edit-side').value;
    const count = document.getElementById('edit-count').value;

    const confirmed = await showConfirm('수정하시겠습니까?');
    if (confirmed) {
        try {
            await updateDoc(doc(db, "rsvps", id), {
                side: side,
                count: parseInt(count)
            });
            showToast('수정되었습니다.');
            setTimeout(() => closeEditModal(), 500);
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    }
};

window.deleteRSVP = async () => {
    const id = document.getElementById('edit-doc-id').value;
    const confirmed = await showConfirm('정말 참석을 취소하시겠습니까?');
    if (confirmed) {
        try {
            await deleteDoc(doc(db, "rsvps", id));
            showToast('취소되었습니다.');
            setTimeout(() => closeEditModal(), 500);
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    }
};
// Gallery Logic
const galleryImages = [
    "assets/gallery/1.jpg",
    "assets/gallery/2.jpg",
    "assets/gallery/3.jpg",
    "assets/gallery/4.jpg",
    "assets/gallery/5.jpg",
    "assets/gallery/6.jpg",
    "assets/gallery/7.jpg",
    "assets/gallery/8.jpg",
    "assets/gallery/9.jpg"
];

let currentImageIndex = 0;

window.openGallery = (index) => {
    currentImageIndex = index;
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('gallery-img');

    // Reset Zoom/State if needed
    modal.style.display = "flex";
    modalImg.src = galleryImages[currentImageIndex];
    document.body.style.overflow = 'hidden';
};

window.closeGallery = () => {
    document.getElementById('gallery-modal').style.display = "none";
    document.body.style.overflow = 'auto';
};

window.changeImage = (n) => {
    currentImageIndex += n;
    if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    }
    document.getElementById('gallery-img').src = galleryImages[currentImageIndex];
};

// Keyboard support
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('gallery-modal');
    if (modal && modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);
        if (e.key === 'Escape') closeGallery();
    }
});

// Mobile Swipe Support
let touchStartX = 0;
let touchEndX = 0;

const galleryModal = document.getElementById('gallery-modal');
if (galleryModal) {
    galleryModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryModal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const threshold = 50; // Minimum distance to be considered a swipe
    if (touchEndX < touchStartX - threshold) {
        changeImage(1); // Swipe Left -> Next
    }
    if (touchEndX > touchStartX + threshold) {
        changeImage(-1); // Swipe Right -> Prev
    }
}
