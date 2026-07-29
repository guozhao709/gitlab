<script>
import {
  GlModal,
  GlForm,
  GlFormGroup,
  GlFormInput,
  GlFormTextarea,
  GlToggle,
  GlButton,
  GlAlert,
  GlIcon,
} from '@gitlab/ui';
import createFlash from '~/flash';
import axios from '~/lib/utils/axios_utils';
import { numberToHumanSize } from '~/lib/utils/number_utils';
import { visitUrl, joinPaths } from '~/lib/utils/url_utility';
import { __ } from '~/locale';
import UploadDropzone from '~/vue_shared/components/upload_dropzone/upload_dropzone.vue';
import {
  SECONDARY_OPTIONS_TEXT,
  COMMIT_LABEL,
  TARGET_BRANCH_LABEL,
  TOGGLE_CREATE_MR_LABEL,
} from '../constants';

const PRIMARY_OPTIONS_TEXT = __('Upload file');
const MODAL_TITLE = __('Upload new file');
const REMOVE_FILE_TEXT = __('Remove file');
const NEW_BRANCH_IN_FORK = __(
  'GitRepo will create a branch in your fork and start a merge request.',
);
const ERROR_MESSAGE = __('Error uploading file. Please try again.');
const TOO_MANY_FILES_MESSAGE = __('文件数量大于1000，请重试');

export default {
  components: {
    GlModal,
    GlForm,
    GlFormGroup,
    GlFormInput,
    GlFormTextarea,
    GlToggle,
    GlButton,
    UploadDropzone,
    GlAlert,
    GlIcon,
  },
  i18n: {
    COMMIT_LABEL,
    TARGET_BRANCH_LABEL,
    TOGGLE_CREATE_MR_LABEL,
    REMOVE_FILE_TEXT,
    NEW_BRANCH_IN_FORK,
  },
  props: {
    modalTitle: {
      type: String,
      default: MODAL_TITLE,
      required: false,
    },
    primaryBtnText: {
      type: String,
      default: PRIMARY_OPTIONS_TEXT,
      required: false,
    },
    modalId: {
      type: String,
      required: true,
    },
    commitMessage: {
      type: String,
      required: true,
    },
    targetBranch: {
      type: String,
      required: true,
    },
    originalBranch: {
      type: String,
      required: true,
    },
    canPushCode: {
      type: Boolean,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    replacePath: {
      type: String,
      default: null,
      required: false,
    },
  },
  data() {
    return {
      commit: this.commitMessage,
      target: this.targetBranch,
      createNewMr: true,
      files: [],
      loading: false,
    };
  },
  computed: {
    primaryOptions() {
      return {
        text: this.primaryBtnText,
        attributes: [
          {
            variant: 'confirm',
            loading: this.loading,
            disabled: !this.formCompleted || this.loading,
          },
        ],
      };
    },
    cancelOptions() {
      return {
        text: SECONDARY_OPTIONS_TEXT,
        attributes: [
          {
            disabled: this.loading,
          },
        ],
      };
    },
    totalFileSize() {
      return numberToHumanSize(this.files.reduce((sum, f) => sum + f.file.size, 0));
    },
    showCreateNewMrToggle() {
      return this.canPushCode && this.target !== this.originalBranch;
    },
    formCompleted() {
      return this.files.length > 0 && this.commit && this.target;
    },
  },
  methods: {
    show() {
      this.$refs[this.modalId].show();
    },
    fileSize(size) {
      return numberToHumanSize(size);
    },
    setFiles(filesOrEntries) {
      // Normalize: could be FileList, File[], or Array<{file, relativePath}>
      const first = Array.isArray(filesOrEntries)
        ? filesOrEntries[0]
        : filesOrEntries[0];

      if (first && first.file instanceof File) {
        // Directory mode: Array<{file, relativePath}>
        filesOrEntries.forEach(({ file, relativePath }) => {
          // Strip the top-level folder name so only inner content is uploaded
          const path = relativePath.split('/').slice(1).join('/') || file.name;
          if (!this.files.some((f) => f.path === path)) {
            this.files.push({ file, path });
          }
        });
      } else {
        // Flat files: FileList or File[]
        const fileArray = Array.isArray(filesOrEntries)
          ? filesOrEntries
          : Array.from(filesOrEntries);
        fileArray.forEach((file) => {
          const rawPath = file.webkitRelativePath || file.name;
          // Strip the top-level folder name so only inner content is uploaded
          const path = rawPath.split('/').slice(1).join('/') || file.name;
          if (!this.files.some((f) => f.path === path)) {
            this.files.push({ file, path });
          }
        });
      }
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    submitForm() {
      return this.replacePath ? this.replaceFile() : this.uploadFile();
    },
    submitRequest(method, url) {
      return axios({
        method,
        url,
        data: this.formData(),
      })
        .then((response) => {
          visitUrl(response.data.filePath);
        })
        .catch((error) => {
          this.loading = false;
          const responseData = error?.response?.data;
          const isTooManyFiles =
            typeof responseData === 'string' &&
            responseData.includes('upload request contains more than');
          createFlash({ message: isTooManyFiles ? TOO_MANY_FILES_MESSAGE : ERROR_MESSAGE });
        });
    },
    formData() {
      const formData = new FormData();
      formData.append('branch_name', this.target);
      formData.append('create_merge_request', this.createNewMr);
      formData.append('commit_message', this.commit);
      if (this.files.length === 1) {
        // Single file: use 'file' param (original behavior, works with Workhorse)
        formData.append('file', this.files[0].file);
      } else {
        // Multiple files: send indexed files[N] and paths[N]
        this.files.forEach(({ file, path }, index) => {
          formData.append(`files[${index}]`, file);
          formData.append(`paths[${index}]`, path);
        });
      }

      return formData;
    },
    replaceFile() {
      this.loading = true;

      // The PUT path can be geneated from $route (similar to "uploadFile") once router is connected
      // Follow-up issue: https://gitlab.com/gitlab-org/gitlab/-/issues/332736
      return this.submitRequest('put', this.replacePath);
    },
    uploadFile() {
      this.loading = true;

      const {
        $route: {
          params: { path },
        },
      } = this;
      const uploadPath = joinPaths(this.path, path);

      return this.submitRequest('post', uploadPath);
    },
  },
  validFileMimetypes: [],
};
</script>
<template>
  <gl-form>
    <gl-modal
      :ref="modalId"
      :modal-id="modalId"
      :title="modalTitle"
      :action-primary="primaryOptions"
      :action-cancel="cancelOptions"
      @primary.prevent="submitForm"
    >
      <upload-dropzone
        class="gl-h-200! gl-mb-4"
        :valid-file-mimetypes="$options.validFileMimetypes"
        :is-file-valid="() => true"
        @change="setFiles"
        directory
      >
        <div
          v-if="files.length"
          class="card upload-dropzone-card upload-dropzone-border gl-w-full gl-h-full gl-align-items-center gl-p-3"
          style="overflow-y: auto;"
        >
          <div
            v-for="({ file, path }, index) in files"
            :key="path"
            class="gl-display-flex gl-align-items-center gl-py-2 gl-w-full"
            :class="{ 'gl-border-b-1': index < files.length - 1 }"
          >
            <gl-icon name="doc-text" :size="16" class="gl-mr-3 gl-text-secondary gl-flex-shrink-0" />
            <div class="gl-flex-grow-1 gl-min-w-0">
              <div class="gl-font-weight-bold gl-text-truncate">{{ path }}</div>
              <div class="gl-text-secondary gl-font-sm">{{ fileSize(file.size) }}</div>
            </div>
            <gl-button
              category="tertiary"
              variant="danger"
              :disabled="loading"
              icon="remove"
              :aria-label="$options.i18n.REMOVE_FILE_TEXT"
              @click="removeFile(index)"
            />
          </div>
        </div>
      </upload-dropzone>
      <gl-form-group :label="$options.i18n.COMMIT_LABEL" label-for="commit_message">
        <gl-form-textarea v-model="commit" name="commit_message" :disabled="loading" />
      </gl-form-group>
      <gl-form-group
        v-if="canPushCode"
        :label="$options.i18n.TARGET_BRANCH_LABEL"
        label-for="branch_name"
      >
        <gl-form-input v-model="target" :disabled="loading" name="branch_name" />
      </gl-form-group>
      <gl-toggle
        v-if="showCreateNewMrToggle"
        v-model="createNewMr"
        :disabled="loading"
        :label="$options.i18n.TOGGLE_CREATE_MR_LABEL"
      />
      <gl-alert v-if="!canPushCode" variant="info" :dismissible="false" class="gl-mt-3">
        {{ $options.i18n.NEW_BRANCH_IN_FORK }}
      </gl-alert>
    </gl-modal>
  </gl-form>
</template>
