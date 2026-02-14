import React, { useState } from "react";
import { Modal, Button } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";

const DeleteNoteModal = ({ open, setOpen, refreshData, noteId }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("book_id", noteId);
            const response = await axios.post(
                `${baseUrl}/admin/courses/delete_pdf.php`,
                formData
            );
            if (response.data.status === "success") {
                toast.success("تم حذف المذكرة بنجاح");
                setOpen(false);
                refreshData();
            } else {
                toast.error(response.data.message || "حدث خطأ أثناء الحذف");
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("حدث خطأ أثناء الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="حذف المذكرة"
            open={open}
            onCancel={() => setOpen(false)}
            footer={[
                <Button key="back" onClick={() => setOpen(false)}>
                    إلغاء
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    danger
                    loading={loading}
                    onClick={handleDelete}
                >
                    حذف
                </Button>,
            ]}
            centered
        >
            <p>هل أنت متأكد من أنك تريد حذف هذه المذكرة؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </Modal>
    );
};

export default DeleteNoteModal;
