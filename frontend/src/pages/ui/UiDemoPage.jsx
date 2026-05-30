import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const UiDemoPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1>UI Design System</h1>
        <p className="text-text-light">A clean, soft, and modern component library.</p>
      </div>

      {/* Buttons */}
      <section>
        <h2>Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small Size</Button>
          <Button size="default">Default Size</Button>
          <Button size="lg">Large Size</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2>Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section className="max-w-md space-y-4">
        <h2>Inputs</h2>
        <Input label="Default Input" placeholder="Type something..." />
        <Input label="Email Address" type="email" placeholder="name@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Input label="Error Input" error="This field is required." placeholder="Invalid input..." />
      </section>

      {/* Cards */}
      <section>
        <h2>Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Soft UI Card</CardTitle>
              <CardDescription>A clean layout for displaying content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card. It has a soft shadow, rounded corners, and a white background.</p>
            </CardContent>
            <CardFooter>
              <Button>Take Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Loaders */}
      <section>
        <h2>Loaders</h2>
        <div className="flex gap-8 items-center bg-surface p-6 rounded-[var(--radius-soft)] border border-gray-100 shadow-sm w-fit">
          <Loader size="sm" />
          <Loader size="default" />
          <Loader size="lg" />
          <Loader size="xl" />
        </div>
      </section>

      {/* Modals & Toasts */}
      <section>
        <h2>Interactive</h2>
        <div className="flex gap-4">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button 
            variant="outline" 
            onClick={() => toast.success('Successfully saved data!')}
          >
            Show Success Toast
          </Button>
          <Button 
            variant="danger" 
            onClick={() => toast.error('Something went wrong.')}
          >
            Show Error Toast
          </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
        >
          <p className="mb-4">This is a reusable modal component. It has a backdrop blur, smooth animation, and closes on ESC or clicking outside.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>
    </div>
  );
};

export default UiDemoPage;
