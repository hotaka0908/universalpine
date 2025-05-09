document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form script loaded');
    
    // Get form elements
    const contactForm = document.getElementById('contactForm');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModalBtn = document.getElementById('closeModal');
    const submitFormBtn = document.getElementById('submitForm');
    const confirmButton = document.querySelector('.submit-button');
    const formFields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        category: document.getElementById('category'),
        message: document.getElementById('message'),
        privacy: document.getElementById('privacy')
    };
    const confirmFields = {
        name: document.getElementById('confirm-name'),
        email: document.getElementById('confirm-email'),
        category: document.getElementById('confirm-category'),
        message: document.getElementById('confirm-message')
    };

    // Show confirmation modal with form data
    function showConfirmation(formData) {
        // Fill confirmation fields with form data
        confirmFields.name.textContent = formData.get('name');
        confirmFields.email.textContent = formData.get('email');
        
        // Get the selected category text
        const categorySelect = formFields.category;
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        confirmFields.category.textContent = selectedOption.text;
        
        confirmFields.message.textContent = formData.get('message');
        
        // Show the modal
        confirmationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close the confirmation modal
    function closeModal() {
        confirmationModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }

    // Handle form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        let isValid = true;
        
        if (!formFields.name.value.trim()) {
            document.getElementById('name-error').textContent = 'お名前を入力してください';
            isValid = false;
        } else {
            document.getElementById('name-error').textContent = '';
        }
        
        if (!formFields.email.value.trim()) {
            document.getElementById('email-error').textContent = 'メールアドレスを入力してください';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email.value.trim())) {
            document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください';
            isValid = false;
        } else {
            document.getElementById('email-error').textContent = '';
        }
        
        if (formFields.category.value === '') {
            document.getElementById('category-error').textContent = 'カテゴリを選択してください';
            isValid = false;
        } else {
            document.getElementById('category-error').textContent = '';
        }
        
        if (!formFields.message.value.trim()) {
            document.getElementById('message-error').textContent = 'お問い合わせ内容を入力してください';
            isValid = false;
        } else {
            document.getElementById('message-error').textContent = '';
        }
        
        if (!formFields.privacy.checked) {
            document.getElementById('privacy-error').textContent = 'プライバシーポリシーに同意してください';
            isValid = false;
        } else {
            document.getElementById('privacy-error').textContent = '';
        }
        
        if (isValid) {
            const formData = new FormData(contactForm);
            showConfirmation(formData);
        }
    });

    // Handle confirmation button click
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            console.log('Confirmation button clicked');
            
            // Basic validation
            let isValid = true;
            
            if (!formFields.name.value.trim()) {
                document.getElementById('name-error').textContent = 'お名前を入力してください';
                isValid = false;
            } else {
                document.getElementById('name-error').textContent = '';
            }
            
            if (!formFields.email.value.trim()) {
                document.getElementById('email-error').textContent = 'メールアドレスを入力してください';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email.value.trim())) {
                document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください';
                isValid = false;
            } else {
                document.getElementById('email-error').textContent = '';
            }
            
            if (formFields.category.value === '') {
                document.getElementById('category-error').textContent = 'カテゴリを選択してください';
                isValid = false;
            } else {
                document.getElementById('category-error').textContent = '';
            }
            
            if (!formFields.message.value.trim()) {
                document.getElementById('message-error').textContent = 'お問い合わせ内容を入力してください';
                isValid = false;
            } else {
                document.getElementById('message-error').textContent = '';
            }
            
            if (!formFields.privacy.checked) {
                document.getElementById('privacy-error').textContent = 'プライバシーポリシーに同意してください';
                isValid = false;
            } else {
                document.getElementById('privacy-error').textContent = '';
            }
            
            if (isValid) {
                console.log('Form is valid, showing confirmation');
                const formData = new FormData(contactForm);
                showConfirmation(formData);
            }
        });
    }

    // Close modal when clicking the close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking the back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the content
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                closeModal();
            }
        });
    }

    // Handle final form submission
    if (submitFormBtn) {
        submitFormBtn.addEventListener('click', function() {
            console.log('Final form submission clicked');
            const formData = new FormData(contactForm);
            
            // Send form data to server
            fetch('https://formsubmit.co/01304b0c4bb0329755e77d5adc3d5138', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Redirect to thanks page
                    window.location.href = 'thanks.html';
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('送信中にエラーが発生しました。後でもう一度お試しください。');
            });
        });
    }
});
