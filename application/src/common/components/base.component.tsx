import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { ErrorMessage } from './ErrorMessage';
import { Loading } from './Loading';

/**
 * Base Component Props
 */
export interface BaseComponentProps {
  style?: ViewStyle;
  children?: ReactNode;
  testID?: string;
}

/**
 * Base State Component Props
 */
export interface BaseStateComponentProps extends BaseComponentProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Base Screen Props
 */
export interface BaseScreenProps extends BaseStateComponentProps {
  title?: string;
  onRefresh?: () => Promise<void>;
}

/**
 * Abstract Base Component Class
 * Provides common component functionality
 */
export abstract class BaseComponent<P extends BaseComponentProps = BaseComponentProps> {
  protected props: P;

  constructor(props: P) {
    this.props = props;
  }

  /**
   * Render method to be implemented by subclasses
   */
  abstract render(): ReactNode;

  /**
   * Get style with defaults
   */
  protected getStyle(style?: ViewStyle): ViewStyle {
    return [styles.container, this.props.style, style];
  }
}

/**
 * Base Stateful Component
 * Handles loading, error, and retry states
 */
export abstract class BaseStateComponent<
  P extends BaseStateComponentProps = BaseStateComponentProps
> {
  protected props: P;

  /**
   * Render loading state
   */
  protected renderLoading(): ReactNode {
    return <Loading size="large" />;
  }

  /**
   * Render error state
   */
  protected renderError(error: string): ReactNode {
    return (
      <ErrorMessage
        message={error}
        onDismiss={this.props.onRetry}
      />
    );
  }

  /**
   * Render empty state
   */
  protected renderEmpty(): ReactNode {
    return null;
  }

  /**
   * Main render logic with state handling
   */
  renderWithState(children: ReactNode): ReactNode {
    if (this.props.error) {
      return this.renderError(this.props.error);
    }

    if (this.props.isLoading && !children) {
      return this.renderLoading();
    }

    return children || this.renderEmpty();
  }
}

/**
 * Base Screen Component
 * Handles full screen layout with refresh, loading, and error states
 */
export abstract class BaseScreen<
  P extends BaseScreenProps = BaseScreenProps
> extends BaseStateComponent<P> {
  protected props: P;

  constructor(props: P) {
    super();
    this.props = props;
  }

  /**
   * Render the screen content
   */
  abstract renderContent(): ReactNode;

  /**
   * Get screen title
   */
  protected getTitle(): string {
    return this.props.title || '';
  }

  /**
   * Handle refresh
   */
  protected async onRefresh(): Promise<void> {
    if (this.props.onRefresh) {
      await this.props.onRefresh();
    }
  }

  /**
   * Render full screen with refresh control
   */
  render(): ReactNode {
    const content = this.renderContent();

    return (
      <ScrollView
        style={[styles.screenContainer, this.props.style]}
        refreshControl={
          <RefreshControl
            refreshing={this.props.isLoading || false}
            onRefresh={() => this.onRefresh()}
            colors={['#4F46E5']}
          />
        }
      >
        {this.renderWithState(content)}
      </ScrollView>
    );
  }
}

/**
 * Base List Component
 * Handles list rendering with common patterns
 */
export abstract class BaseListComponent<
  T,
  P extends BaseStateComponentProps = BaseStateComponentProps
> extends BaseStateComponent<P> {
  protected props: P;
  protected items: T[];

  constructor(props: P, items: T[] = []) {
    super();
    this.props = props;
    this.items = items;
  }

  /**
   * Render individual list item
   */
  abstract renderItem(item: T, index: number): ReactNode;

  /**
   * Render empty list state
   */
  protected renderEmptyList(): ReactNode {
    return null;
  }

  /**
   * Render list
   */
  renderList(): ReactNode {
    if (this.items.length === 0) {
      return this.renderEmptyList();
    }

    return (
      <View style={styles.listContainer}>
        {this.items.map((item, index) => (
          <View key={index}>
            {this.renderItem(item, index)}
          </View>
        ))}
      </View>
    );
  }

  /**
   * Main render with state handling
   */
  render(): ReactNode {
    return this.renderWithState(this.renderList());
  }
}

/**
 * Base Form Component
 * Handles form state and submission
 */
export abstract class BaseFormComponent<F extends Record<string, any>> {
  protected formData: F;
  protected errors: Partial<Record<keyof F, string>>;
  protected isSubmitting: boolean;

  constructor(initialData: F) {
    this.formData = { ...initialData };
    this.errors = {};
    this.isSubmitting = false;
  }

  /**
   * Set form field value
   */
  setFieldValue<K extends keyof F>(field: K, value: F[K]): void {
    this.formData[field] = value;
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  /**
   * Set field error
   */
  setFieldError<K extends keyof F>(field: K, error: string): void {
    this.errors[field] = error;
  }

  /**
   * Validate form
   */
  protected validate(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Reset form
   */
  reset(initialData: F): void {
    this.formData = { ...initialData };
    this.errors = {};
    this.isSubmitting = false;
  }

  /**
   * Get form data
   */
  getFormData(): F {
    return { ...this.formData };
  }

  /**
   * Get form errors
   */
  getErrors(): Partial<Record<keyof F, string>> {
    return { ...this.errors };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    paddingVertical: 12,
  },
});
