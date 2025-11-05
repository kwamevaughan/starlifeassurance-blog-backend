import React from 'react';
import SimpleModal from './SimpleModal';
import { Icon } from '@iconify/react';
import FormActions from '../forms/FormActions';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  mode, 
  itemType = "item",
  isDeleting = false
}) => {
  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
      mode={mode}
      width="max-w-lg"
    >
      <div className="py-6">
        <div className="text-center mb-6">
          <Icon
            icon="mdi:alert-circle"
            className="w-16 h-16 mx-auto mb-4 text-red-500"
          />
          <div className={`text-xl font-semibold mb-2 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </div>
          <div className={`text-lg font-medium mb-4 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            Are you sure you want to delete &ldquo;{itemName}&rdquo;?
          </div>
        </div>

        {/* Warning Details */}
        <div className={`border rounded-lg p-4 mb-6 ${
          mode === "dark"
            ? 'bg-red-900/20 border-red-800'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <Icon
              icon="mdi:alert-circle"
              className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600"
            />
            <div className={`text-sm ${
              mode === "dark" ? 'text-red-300' : 'text-red-800'
            }`}>
              <div className="font-semibold mb-2">Warning: This action cannot be undone!</div>
              <ul className="space-y-1 list-disc list-inside">
                {itemType === 'blog post' && (
                  <>
                    <li>The blog post content will be permanently deleted</li>
                    <li>Any comments or engagement data will be lost</li>
                    <li>The post will no longer be accessible to readers</li>
                    <li>SEO rankings for this content may be affected</li>
                  </>
                )}
                {itemType === 'category' && (
                  <>
                    <li>All blog posts in this category will become uncategorized</li>
                    <li>Category-based navigation will be affected</li>
                    <li>SEO and site structure may be impacted</li>
                  </>
                )}
                {itemType === 'tag' && (
                  <>
                    <li>This tag will be removed from all associated blog posts</li>
                    <li>Tag-based filtering and search will be affected</li>
                  </>
                )}
                {!['blog post', 'category', 'tag'].includes(itemType) && (
                  <li>All related data and history will be permanently lost</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <FormActions
          onCancel={onClose}
          onSave={onConfirm}
          loading={isDeleting}
          mode={mode}
          variant="danger"
          saveText={isDeleting ? 'Deleting...' : 'Delete Permanently'}
          saveIcon={isDeleting ? "mdi:loading" : "mdi:delete"}
          cancelText="Cancel"
        />
      </div>
    </SimpleModal>
  );
};

export default ConfirmDeleteModal;